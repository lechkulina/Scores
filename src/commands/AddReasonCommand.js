const {OptionId, StringOption, NumberOption} = require('../options/CommonOptions');
const {StringsLengthsValidator, FirstLetterValidator, NumbersValuesValidator, NumbersRangesValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class AddReasonInteractionHandler extends InteractionHandler {
  initialize(interaction) {
    this.name = this.getOptionValue(OptionId.Name);
    this.min = this.getOptionValue(OptionId.Min);
    this.max = this.getOptionValue(OptionId.Max);
    return Promise.resolve();
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      await this.dataModel.addReason(this.name, this.min, this.max);
      return interaction.createMessage({
        content: this.translate('commands.addReason.messages.success', {
          reasonName: this.name,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addReason.errors.failure'));
    }
  }
}

class AddReasonCommand extends Command {
  constructor(...props) {
    super('add-reason', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addReason.description'));
    this.addOptions([
      new StringOption(OptionId.Name, this.translate('commands.addReason.options.name')),
      new NumberOption(OptionId.Min, this.translate('commands.addReason.options.min')),
      new NumberOption(OptionId.Max, this.translate('commands.addReason.options.max')),
    ]);
    this.addValidators([
      new StringsLengthsValidator([OptionId.Name], 'minNameLength', 'maxNameLength', this.settings, this.options),
      new FirstLetterValidator([OptionId.Name], this.options),
      new NumbersValuesValidator([OptionId.Min, OptionId.Max], this.options),
      new NumbersRangesValidator([
        [OptionId.Min, OptionId.Max]
      ], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddReasonInteractionHandler(...props);
  }
}

module.exports = AddReasonCommand;
