const {OptionId, StringOption, NumberOption} = require('../Options');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');

class AddReasonInteractionHandler extends InteractionHandler {
  initialize(interaction) {
    this.name = this.getOptionValue(OptionId.Name);
    this.min = this.getOptionValue(OptionId.Min);
    this.max = this.getOptionValue(OptionId.Max);
    return Promise.resolve();
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    if (this.name === '') {
      return interaction.createMessage(this.translate('commands.addReason.errors.invalidName'));
    }
    if (this.min >= this.max) {
      return interaction.createMessage(this.translate('commands.addReason.errors.invalidRange', {
        min: this.min,
        max: this.max,
      }));
    }
    try {
      await this.dataModel.addReason(this.name, this.min, this.max);
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addReason.errors.failure'));
    }
    return interaction.createMessage({
      content: this.translate('commands.addReason.messages.success', {
        reasonName: this.name,
      })
    });
  }
}

class AddReasonCommand extends Command {
  constructor(translate) {
    super(translate, 'add-reason');
  }

  initialize() {
    this.setDescription(this.translate('commands.addReason.description'));
    this.addOption(new StringOption(OptionId.Name, this.translate('commands.addReason.options.name')));
    this.addOption(new NumberOption(OptionId.Min, this.translate('commands.addReason.options.min')));
    this.addOption(new NumberOption(OptionId.Max, this.translate('commands.addReason.options.max')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddReasonInteractionHandler(...props);
  }
}

module.exports = AddReasonCommand;
