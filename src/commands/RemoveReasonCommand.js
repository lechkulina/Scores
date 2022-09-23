const ReasonOption = require('../options/ReasonOption');
const {OptionId} = require('../options/CommonOptions');
const {ReasonValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RemoveReasonInteractionHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.reason = this.getOptionValue(OptionId.Reason);
    return interaction.createMessage({
      content: this.translate('commands.removeReason.messages.confirmation', {
        reasonName: this.reason.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removeReason(this.reason.id);
        return this.translate('commands.removeReason.messages.success', {
          reasonName: this.reason.name,
        });
      } catch (error) {
        return this.translate('commands.removeReason.errors.failure', {
          reasonName: this.reason.name,
        });
      }
    });
  }
}

class RemoveReasonCommand extends Command {
  constructor(...props) {
    super('remove-reason', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removeReason.description'));
    this.addOptions([
      new ReasonOption(OptionId.Reason, this.translate('commands.removeReason.options.reason'), this.dataModel)
    ]);
    this.addValidators([
      new ReasonValidator(OptionId.Reason, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemoveReasonInteractionHandler(...props);
  }
}

module.exports = RemoveReasonCommand;
