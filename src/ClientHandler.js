const {CommandClient} = require('eris');
const EventEmitter = require('events');
const {discord: discordCredentials} = require('../credentials.js');
const config = require('../config.js');
const InteractionManager = require('./InteractionManager');
const ClientHandlerEvents = require('./ClientHandlerEvents');

class ClientHandler extends EventEmitter {
  constructor() {
    super();
    this.client = new CommandClient(discordCredentials.token);
    this.interactionManager = new InteractionManager(this);
    this.onReadyCallback = this.onReady.bind(this);
    this.onErrorCallback = this.onError.bind(this);
    this.onInteractionCreateCallback = this.onInteractionCreate.bind(this);
    this.onMessageDeleteCallback = this.onMessageDelete.bind(this);
    this.onMessageDeleteBulkCallback = this.onMessageDeleteBulk.bind(this);
  }

  async onReady() {
    console.info('Client is ready');
    await this.interactionManager.initialize();
    console.info('Client is initialized');
  };
  
  onError(error) {
    console.error('Unexpected client error ', error);
  };
  
  onInteractionCreate(interaction) {
    return this.interactionManager.handleInteraction(interaction);
  }

  onMessageDelete(...params) {
    this.emit(ClientHandlerEvents.onMessageDelete, ...params);
  }

  onMessageDeleteBulk(...params) {
    this.emit(ClientHandlerEvents.onMessageDeleteBulk, ...params);
  }

  initialize() {
    this.client.on('ready', this.onReadyCallback);
    this.client.on('error', this.onErrorCallback);
    this.client.on("interactionCreate", this.onInteractionCreateCallback);
    this.client.on('messageDelete', this.onMessageDeleteCallback);
    this.client.on('messageDeleteBulk', this.onMessageDeleteBulkCallback);
    this.client.connect();
  }

  uninitialize() {
    this.client.off('ready', this.onReadyCallback);
    this.client.off('error', this.onErrorCallback);
    this.client.off("interactionCreate", this.onInteractionCreateCallback);
    this.client.off('messageDelete', this.onMessageDeleteCallback);
    this.client.off('messageDeleteBulk', this.onMessageDeleteBulkCallback);
  }

  registerCommands(commandsConfig) {
    // TODO remove this config
    return config.discord.guildId
      ? this.client.bulkEditGuildCommands(config.discord.guildId, commandsConfig)
      : this.client.bulkEditCommands(commandsConfig);
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

  deleteMessages(channelId, messagesIds) {
    return this.client.deleteMessages(channelId, messagesIds);
  }

  createMessage(channelId, content) {
    return this.client.createMessage(channelId, content);
  }

  editMessage(channelId, messageId, content) {
    return this.client.editMessage(channelId, messageId, content);
  }
}

module.exports = ClientHandler;
