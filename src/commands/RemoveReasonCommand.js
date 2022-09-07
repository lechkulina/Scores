const ReasonOption = require('../options/ReasonOption');
const {OptionId} = require('../options/CommonOptions');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RemoveReasonInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.reason = await this.dataModel.getReason(this.getOptionValue(OptionId.Reason));
  }

  async handleCommandInteraction(interaction) {
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
  constructor(translate) {
    super(translate, 'remove-reason');
  }

  initialize() {
    this.setDescription(this.translate('commands.removeReason.description'));
    this.addOption(new ReasonOption(this.translate('commands.removeReason.options.reason')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemoveReasonInteractionHandler(...props);
  }
}

module.exports = RemoveReasonCommand;
