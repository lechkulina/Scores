const ReasonOption = require('../options/ReasonOption');
const {OptionId, StringOption, NumberOption} = require('../options/CommonOptions');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  NumbersValuesValidator,
  NumbersRangesValidator,
  ReasonValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class ChangeReasonInteractionHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.reason = this.getOptionValue(OptionId.Reason);
    return interaction.createMessage({
      content: this.translate('commands.changeReason.messages.confirmation', {
        reasonName: this.reason.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const [name, min, max] = this.getOptionValues([OptionId.Name, OptionId.Min, OptionId.Max]);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeReason(this.reason.id, name, min, max);
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
      new ReasonOption(OptionId.Reason, this.translate('commands.changeReason.options.reason'), this.dataModel),
      new StringOption(OptionId.Name, this.translate('commands.changeReason.options.name')),
      new NumberOption(OptionId.Min, this.translate('commands.changeReason.options.min')),
      new NumberOption(OptionId.Max, this.translate('commands.changeReason.options.max')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    this.addValidators([
      new StringsLengthsValidator(minNameLength, maxNameLength, [OptionId.Name], this.options),
      new FirstLetterValidator([OptionId.Name], this.options),
      new NumbersValuesValidator([OptionId.Min, OptionId.Max], this.options),
      new NumbersRangesValidator([
        [OptionId.Min, OptionId.Max]
      ], this.options),
      new ReasonValidator(OptionId.Reason, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeReasonInteractionHandler(...props);
  }
}

module.exports = ChangeReasonCommand;
