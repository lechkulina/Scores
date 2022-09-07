const ReasonOption = require('../options/ReasonOption');
const {OptionId, StringOption, NumberOption} = require('../options/CommonOptions');
const {StringsLengthsValidator, FirstLetterValidator, NumbersValuesValidator, NumbersRangesValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class ChangeReasonInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.reason = await this.dataModel.getReason(this.getOptionValue(OptionId.Reason));
    this.name = this.getOptionValue(OptionId.Name);
    this.min = this.getOptionValue(OptionId.Min);
    this.max = this.getOptionValue(OptionId.Max);
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.changeReason.messages.confirmation', {
        reasonName: this.reason.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeReason(this.reason.id, this.name, this.min, this.max);
        return this.translate('commands.changeReason.messages.success', {
          reasonName: this.reason.name,
        });
      } catch (error) {
        return this.translate('commands.changeReason.errors.failure', {
          reasonName: this.reason.name,
        });
      }
    });
  }
}

class ChangeReasonCommand extends Command {
  constructor(...props) {
    super('change-reason', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changeReason.description'));
    this.addOptions([
      new ReasonOption(this.translate('commands.changeReason.options.reason')),
      new StringOption(OptionId.Name, this.translate('commands.changeReason.options.name')),
      new NumberOption(OptionId.Min, this.translate('commands.changeReason.options.min')),
      new NumberOption(OptionId.Max, this.translate('commands.changeReason.options.max')),
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
    return new ChangeReasonInteractionHandler(...props);
  }
}

module.exports = ChangeReasonCommand;
