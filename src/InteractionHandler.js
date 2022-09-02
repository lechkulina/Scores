class InteractionHandler {
  constructor(client, dataModel, optionsValues) {
    this.client = client;
    this.dataModel = dataModel;
    this.optionsValues = optionsValues;
    this.done = false;
  }

  getOptionValue(optionName) {
    return this.optionsValues.get(optionName);
  }

  isDone() {
    return this.done;
  }

  markAsDone() {
    this.done = true;
  }

  async createDirectMessagesChannel(guildId, userId) {
    const guild = this.client.guilds.find(({id}) => id === guildId);
    if (!guild) {
      console.error(`Unable to create direct messages channel - unknown guild id ${guildId}`);
      return;
    }
    const members = await guild.fetchMembers({
      userIDs: [userId],
      limit: 1,
      presences: false,
    });
    const user = members[0]?.user;
    if (!user) {
      console.error(`Unable to create direct messages channel - unknown user id ${userId}`);
      return;
    }
    return user.getDMChannel();
  }

  findPublicChannel(guildId) {
    const guild = this.client.guilds.find(({id}) => id === guildId);
    if (!guild) {
      console.error(`Unable to get public channel - unknown guild id ${guildId}`);
      return;
    }
    const publicChannelId = this.dataModel.getSetting('publicChannelId');
    return guild.channels.find(channel => channel.id === publicChannelId);
  }

  async handleCommandInteraction(commandInteraction) {
    throw new Error('handleCommandInteraction not implemented');
  }

  async handleComponentInteraction(componentInteraction) {
    throw new Error('handleComponentInteraction not implemented');
  }
}

module.exports = InteractionHandler;
