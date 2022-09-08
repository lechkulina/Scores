class ClientSupport {
  constructor(client, settings) {
    this.client = client;
    this.settings = settings;
  }

  findGuild(guildId) {
    return this.client.guilds.find(({id}) => id === guildId);
  }

  async findMember(guildId, userId) {
    const guild = this.findGuild(guildId);
    if (!guild) {
      return;
    }
    const members = await guild.fetchMembers({
      userIDs: [userId],
      limit: 1,
      presences: false,
    });
    return members[0];
  }

  async findUser(guildId, userId) {
    return (await this.findMember(guildId, userId))?.user;
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
    return (await this.findUser(guildId, userId))?.getDMChannel();
  }

  async findPublicChannel(guildId) {
    const publicChannelId = await this.settings.get('publicChannelId');
    return this.findChannel(guildId, publicChannelId);
  }
}

module.exports = ClientSupport;
