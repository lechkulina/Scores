class InteractionHandler {
  constructor(client, dataModel, settings, translate, optionsValues) {
    this.client = client;
    this.dataModel = dataModel;
    this.settings = settings;
    this.translate = translate;
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

  findGuild(guildId) {
    return this.client.guilds.find(({id}) => id === guildId);
  }

  async findUser(guildId, userId) {
    const guild = this.findGuild(guildId);
    if (!guild) {
      return;
    }
    const members = await guild.fetchMembers({
      userIDs: [userId],
      limit: 1,
      presences: false,
    });
    return members[0]?.user;
  }

  findRole(guildId, roleId) {
    const guild = this.findGuild(guildId);
    return guild?.roles.find(({id}) => id === roleId);
  }

  findChannel(guildId, channelId) {
    const guild = this.findGuild(guildId);
    return guild?.channels.find(({id}) => id === channelId);
  }

  async createDirectMessagesChannel(guildId, userId) {
    return await this.findUser(guildId, userId)?.getDMChannel();
  }

  async findPublicChannel(guildId) {
    const publicChannelId = await this.settings.get('publicChannelId');
    return this.findChannel(guildId, publicChannelId);
  }

  initialize() {
    return Promise.resolve();
  }

  handleCommandInteraction(interaction) {
    return Promise.resolve();
  }

  handleComponentInteraction(interaction) {
    return Promise.resolve();
  }
}

module.exports = InteractionHandler;
