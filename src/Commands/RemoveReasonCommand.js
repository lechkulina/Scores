const {Constants: {ButtonStyles}} = require('eris');
const ReasonOption = require('../ReasonOption');
const {OptionId} = require('../Options');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, actionRow, button} = require('../Components');

class RemoveReasonInteractionHandler extends InteractionHandler {
  async initialize() {
    this.reason = await this.dataModel.getReason(this.getOptionValue(OptionId.Reason));
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.removeReason.messages.confirmation', {
        reasonName: this.reason.name,
      }),
      components: [
        actionRow([
          button(ButtonId.No, this.translate('common.no')),
          button(ButtonId.Yes, this.translate('common.yes'), ButtonStyles.DANGER),
        ]),
      ],
    });
  }

  async removeReason() {
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
  }

  async handleComponentInteraction(interaction) {
    this.markAsDone();
    const content = await (() => {
      const buttonId = interaction.data.custom_id;
      switch (buttonId) {
        case ButtonId.No:
          return Promise.resolve(this.translate('common.canceled'));
        case ButtonId.Yes:
          return this.removeReason();
      }
    })();
    return interaction.createMessage(content);
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
