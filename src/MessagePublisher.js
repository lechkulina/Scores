const md5 = require('md5');
const {Entities} = require('./Formatters');
const ClientSupport = require('./ClientSupport');

const SectionType = {
  Paragraph: 0,
  Line: 1,
};

class MessagePublisher extends ClientSupport {
  constructor(client, dataModel, settings) {
    super(client, settings);
    this.dataModel = dataModel;
    this.removeMessagesLock = Promise.resolve();
    this.onMessageDeleteCallback = this.onMessageDelete.bind(this);
    this.onMessageDeleteBulkCallback = this.onMessageDeleteBulk.bind(this);
  }

  divideContentIntoSections(content, sectionSize) {
    // first by paragraphs
    const sections = [];
    const paragraphs = content.split(/\n+\s*\n+/g);
    paragraphs.forEach((paragraph, paragraphIndex) => {
      const lastParagraph = paragraphIndex === paragraphs.length - 1;
      const paragraphEntity = lastParagraph ? '' : Entities.EmptyLine;
      if (paragraph.length + paragraphEntity.length <= sectionSize) {
        sections.push({
          content: paragraph + paragraphEntity,
          type: SectionType.Paragraph,
        });
        return;
      }
      // divide the paragraph further into individual lines
      const lines = paragraph.split(/\n/g);
      lines.forEach((line, lineIndex) => {
        const lastLine = lineIndex === lines.length - 1;
        const lineEntity = lastLine ? paragraphEntity : Entities.NewLine;
        if (line.length + lineEntity <= sectionSize) {
          sections.push({
            content: line + lineEntity,
            type: SectionType.Line,
          });
          return;
        }
        // line it too long it needs to be sliced into fragments
        let fragmentIndex = 0;
        while (fragmentIndex < line.length) {
          const fragment = line.slice(fragmentIndex, fragmentIndex + sectionSize);
          sections.push({
            content: fragment,
            type: SectionType.Line,
          });
          fragmentIndex += sectionSize;
        }
      });
    });
    return sections;
  }

  mergeSectionsIntoChunks(sections, chunkSize) {
    // try to merge as many of the sections of the same type as possible
    const chunks = [];
    let sectionIndex = 0;
    while (sectionIndex < sections.length) {
      const section = sections[sectionIndex];
      let subSectionIndex = sectionIndex;
      let subSectionContent = '';
      while (subSectionIndex <= sections.length) {
        const subSection = sections[subSectionIndex];
        if (subSectionIndex === sections.length  // end of content
          || subSection.type !== section.type  // section type is changing
          || subSectionContent.length + subSection.content > chunkSize // chunk overflow
        ) {
          chunks.push(subSectionContent);
          subSectionContent = '';
          break;
        }
        subSectionContent += subSection.content;
        subSectionIndex++;
      }
      sectionIndex = subSectionIndex;
    }
    return chunks;
  }

  divideContentIntoChunks(content, chunkSize) {
    if (content.length <= chunkSize) {
      return [content];
    }
    // divide content into sections like paragraphs and lines and then try to merged as many of the sections of the same type as possible
    const sections = this.divideContentIntoSections(content, chunkSize);
    return this.mergeSectionsIntoChunks(sections, chunkSize);
  }
  
  async createContentChunks(content) {
    const chunkSize = await this.settings.get('messageChunkSize');
    return this.divideContentIntoChunks(content, chunkSize).map(chunkContent => ({
      content: chunkContent,
      hash: md5(chunkContent),
    }));
  }

  async createMessage(guildId, channelId, content) {
    // find the given channel
    const channel = this.findChannel(guildId, channelId);
    if (!channel) {
      console.error(`Unable to create message - channel ${channelId} is missing`);
      return;
    }
    // create content chunks for the incoming message
    const contentChunks = await this.createContentChunks(content);
    if (contentChunks.length === 0) {
      console.error(`Unable to create message without content chunks`);
      return;
    }
    // create message for each content message
    console.debug(`Creating ${contentChunks.length} message chunks`);
    const messageChunks = [];
    try {
      for (const contentChunk of contentChunks) {
        const message = await channel.createMessage(contentChunk.content);
        messageChunks.push({
          id: message.id,
          hash: contentChunk.hash,
        });
      }
    } catch(error) {
      console.error(`Failed to create message chunks for message ${messageId} - got error ${error}`);
      return;
    }
    // update the model - message id is the id of the first chunk
    const messageId = messageChunks[0].id;
    await this.dataModel.addMessage(guildId, channelId, messageId, messageChunks);
    return messageId;
  }

  async updateMessage(messageId, content) {
    // create content chunks and check if the message should exists
    const newContentChunks = await this.createContentChunks(content);
    if (newContentChunks.length === 0) {
      return this.removeMessages([messageId]);
    }
    // get storged message and fetch it's channel
    const message = await this.dataModel.getMessage(messageId);
    if (!message) {
      console.error(`Unable to update message ${messageId} - unknown message`);
      return;
    }
    const channel = this.findChannel(message.guildId, message.channelId);
    if (!channel) {
      console.error(`Unable to update message - channel ${message.channelId} is missing`);
      return;
    }
    // find which chunks are updated, new or obsolete
    const obsoleteMessageChunks = await this.dataModel.getMessageChunks(messageId);
    const updatedChunks = [];
    while (obsoleteMessageChunks.length > 0 && newContentChunks.length > 0) {
      const messageChunk = obsoleteMessageChunks.shift();
      const contentChunk = newContentChunks.shift();
      if (messageChunk && contentChunk && messageChunk.hash !== contentChunk.hash) {
        updatedChunks.push({
          contentChunk,
          messageChunk,
        });
      }
    }
    // there is no way to insert messages in the text channels
    if (newContentChunks.length > 0) {
      console.error(`Found ${newContentChunks.length} new content chunks - skipping from updating the entire message ${messageId}`);
      return;
    }
    // delete obsolete message chunks
    if (obsoleteMessageChunks.length > 0) {
      console.debug(`Deleting ${obsoleteMessageChunks.length} message chunks from message ${messageId}`);
      try {
        for (const messageChunk of obsoleteMessageChunks) {
          await channel.deleteMessage(messageChunk.id);
        }
      } catch (error) {
        console.error(`Failed to delete message chunks from message ${messageId} - got error ${error}`);
        return;
      }
    }
    // edit updated message chunks
    const updatedMessageChunks = [];
    if (updatedChunks.length > 0) {
      console.debug(`Updating ${updatedChunks.length} message chunks from message ${messageId}`);
      try {
        for (const {contentChunk, messageChunk} of updatedChunks) {
          await channel.editMessage(messageChunk.id, contentChunk.content);
          updatedMessageChunks.push({
            id: messageChunk.id,
            hash: contentChunk.hash,
          });
        }
      } catch(error) {
        console.error(`Failed to edit message chunks from message ${messageId} - got error ${error}`);
        return;
      }
    }
    // update the model
    return this.dataModel.updateMessage(messageId, updatedMessageChunks, obsoleteMessageChunks);
  }

  removeMessages(messagesIds, removedChunksIds = []) {
    // removing messages needs to be synchonized - onMessageDelete callback may be called while removing obsolete message chunks
    this.removeMessagesLock = this.removeMessagesLock.finally(async () => {
      const obsoleteMessagesIds = [];
      for (const messageId of messagesIds) {
        const message = await this.dataModel.getMessage(messageId);
        if (!message) {
          console.error(`Unable to delete message ${messageId} - unknown message`);
          continue;
        }
        obsoleteMessagesIds.push(messageId);
        // remove obsolete message chunks that have not already been removed
        const messageChunks = await this.dataModel.getMessageChunks(messageId);
        const obsoleteMessageChunksIds = messageChunks
          .map(({id}) => id)
          .filter(id => !removedChunksIds.includes(id));
        if (obsoleteMessageChunksIds.length > 0) {
          console.debug(`Removing ${obsoleteMessageChunksIds.length} message chunks from message ${messageId}`);
          try {
            await this.client.deleteMessages(message.channelId, obsoleteMessageChunksIds);
          } catch (error) {
            console.error(`Failed to delete message chunks from message ${messageId} - got error ${error}`);
            continue;
          }
        }
      }
      // update the model
      console.info(`Removing ${obsoleteMessagesIds.length} messages`);
      await this.dataModel.removeMessages(obsoleteMessagesIds);
    });
    return this.removeMessagesLock;
  }

  async onMessageDelete(removedMessageChunk) {
    const messageChunk = await this.dataModel.getMessageChunk(removedMessageChunk.id);
    if (!messageChunk) {
      return;
    }
    return this.removeMessages([messageChunk.messageId], [removedMessageChunk.id]);
  }

  async onMessageDeleteBulk(removedMessagesChunks) {
    const removedMessagesChunksIds = removedMessagesChunks.map(({id}) => id);
    const messagesIds = new Set();
    const messagesChunks = await Promise.all(
      removedMessagesChunksIds.map(id => this.dataModel.getMessageChunk(id))
    );
    messagesChunks
      .filter(messagesChunk => !!messagesChunk)
      .forEach(({messageId}) => messagesIds.add(messageId));
    return this.removeMessages(Array.from(messagesIds.values()), removedMessagesChunksIds);
  }

  initialize() {
    this.client.on('messageDelete', this.onMessageDeleteCallback);
    this.client.on('messageDeleteBulk', this.onMessageDeleteBulkCallback);
  }

  uninitialize() {
    this.client.off('messageDelete', this.onMessageDeleteCallback);
    this.client.off('messageDeleteBulk', this.onMessageDeleteBulkCallback);
  }
}

module.exports = MessagePublisher;