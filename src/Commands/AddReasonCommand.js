const {Constants: {ApplicationCommandTypes, ApplicationCommandOptionTypes, ComponentTypes, ButtonStyles}} = require('eris');
const Option = require('../Option');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');

const nameOptionName = 'name';
const minOptionName = 'min';
const maxOptionName = 'max';

class AddReasonInteractionHandler extends InteractionHandler {
  constructor(client, dataModel, settings, translate, optionsValues) {
    super(client, dataModel, settings, translate, optionsValues);
  }

  initialize() {
    this.name = this.getOptionValue(nameOptionName);
    this.min = this.getOptionValue(minOptionName);
    this.max = this.getOptionValue(maxOptionName);
    return Promise.resolve();
  }

  async handleCommandInteraction(interaction) {
    if (this.name === '') {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.addReason.errors.invalidName'));
    }
    if (this.min >= this.max) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.addReason.errors.invalidRange', {
        min: this.min,
        max: this.max,
      }));
    }
    try {
      await this.dataModel.addReason(this.name, this.min, this.max);
    } catch (error) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.addReason.errors.genericFailure'));
    }
    return interaction.createMessage({
      content: this.translate('commands.addReason.messages.successStatus', {
        reasonName: this.name,
      })
    });
  }
}

class AddReasonCommand extends Command {
  constructor(translate) {
    super(translate, 'add-reason', ApplicationCommandTypes.CHAT_INPUT);
  }

  initialize() {
    this.setDescription(this.translate('commands.addReason.description'));
    this.addOption(new Option(nameOptionName, this.translate('commands.addReason.options.name'), ApplicationCommandOptionTypes.STRING, true, false));
    this.addOption(new Option(minOptionName, this.translate('commands.addReason.options.min'), ApplicationCommandOptionTypes.NUMBER, true, false));
    this.addOption(new Option(maxOptionName, this.translate('commands.addReason.options.max'), ApplicationCommandOptionTypes.NUMBER, true, false));
    return Promise.resolve();
  }

  createInteractionHandler(client, dataModel, settings, translate, optionsValues) {
    return new AddReasonInteractionHandler(client, dataModel, settings, translate, optionsValues);
  }
}

module.exports = AddReasonCommand;
