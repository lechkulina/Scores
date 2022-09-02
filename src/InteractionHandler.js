class InteractionHandler {
  constructor(client, dataModel, settings, optionsValues) {
    this.client = client;
    this.dataModel = dataModel;
    this.settings = settings;
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

  async findPublicChannel(guildId) {
    const guild = this.client.guilds.find(({id}) => id === guildId);
    if (!guild) {
      console.error(`Unable to get public channel - unknown guild id ${guildId}`);
      return;
    }
    const publicChannelId = await this.settings.get('publicChannelId');
    return guild.channels.find(channel => channel.id === publicChannelId);
  }

  async handleCommandInteraction(interaction) {
    throw new Error('handleCommandInteraction not implemented');
  }

  async handleComponentInteraction(interaction) {
    throw new Error('handleComponentInteraction not implemented');
  }
}

module.exports = InteractionHandler;
