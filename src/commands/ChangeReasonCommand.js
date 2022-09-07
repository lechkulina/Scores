const {OptionId, StringOption, NumberOption} = require('../Options');
const ReasonOption = require('../ReasonOption');
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
    if (this.name === '') {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.changeReason.errors.invalidName'));
    }
    if (this.min >= this.max) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.changeReason.errors.invalidRange', {
        min: this.min,
        max: this.max,
      }));
    }
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
  constructor(translate) {
    super(translate, 'change-reason');
  }

  initialize() {
    this.setDescription(this.translate('commands.changeReason.description'));
    this.addOption(new ReasonOption(this.translate('commands.changeReason.options.reason')));
    this.addOption(new StringOption(OptionId.Name, this.translate('commands.changeReason.options.name')));
    this.addOption(new NumberOption(OptionId.Min, this.translate('commands.changeReason.options.min')));
    this.addOption(new NumberOption(OptionId.Max, this.translate('commands.changeReason.options.max')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeReasonInteractionHandler(...props);
  }
}

module.exports = ChangeReasonCommand;
