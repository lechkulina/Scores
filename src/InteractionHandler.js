const {Constants: {ButtonStyles}} = require('eris');
const {ButtonId, createActionRow, createButton} = require('./Components');

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

  getOptionValues(optionsIds) {
    return optionsIds.map(optionId => this.optionsValues.get(optionId));
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

  createConfirmationForm() {
    return [
      createActionRow([
        createButton(ButtonId.No, this.translate('common.no')),
        createButton(ButtonId.Yes, this.translate('common.yes'), ButtonStyles.DANGER),
      ]),
    ];
  }

  async handleConfirmationForm(interaction, onConfirmation) {
    this.markAsDone();
    const content = await (() => {
      const buttonId = interaction.data.custom_id;
      switch (buttonId) {
        case ButtonId.No:
          return Promise.resolve(this.translate('common.canceled'));
        case ButtonId.Yes:
          return onConfirmation?.();
      }
    })();
    return interaction.createMessage(content);
  }

  initialize() {
    return Promise.resolve();
  }

  handleCommandInteraction(interaction) {
    this.markAsDone();
    return interaction.acknowledge();
  }

  handleComponentInteraction(interaction) {
    this.markAsDone();
    return interaction.acknowledge();
  }
}

module.exports = InteractionHandler;
