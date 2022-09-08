const {Constants: {ButtonStyles}} = require('eris');
const {ButtonId, createActionRow, createButton} = require('./Components');
const ClientSupport = require('./ClientSupport');

class InteractionHandler extends ClientSupport {
  constructor(client, dataModel, settings, translate, optionsValues) {
    super(client, settings);
    this.dataModel = dataModel;
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
