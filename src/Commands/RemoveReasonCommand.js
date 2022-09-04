const {Constants: {ApplicationCommandTypes, ApplicationCommandOptionTypes, ComponentTypes, ButtonStyles}} = require('eris');
const ReasonOption = require('../ReasonOption');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');

const reasonOptionId = 'reason';

const noButtonId = 'no-button-id';
const yesButtonId = 'yes-button-id';

class RemoveReasonInteractionHandler extends InteractionHandler {
  constructor(client, dataModel, settings, translate, optionsValues) {
    super(client, dataModel, settings, translate, optionsValues);
  }

  async initialize() {
    this.reason = await this.dataModel.getReason(this.getOptionValue(reasonOptionId));
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.removeReason.messages.confirmation', {
        reasonName: this.reason.name,
      }),
      components: [{
        type: ComponentTypes.ACTION_ROW,
        components: [{
          type: ComponentTypes.BUTTON,
          style: ButtonStyles.PRIMARY,
          custom_id: noButtonId,
          label: this.translate('common.no'),
        }, {
          type: ComponentTypes.BUTTON,
          style: ButtonStyles.DANGER,
          custom_id: yesButtonId,
          label: this.translate('common.yes'),
        }],
      }],
    });
  }

  async removeReason() {
    try {
      await this.dataModel.removeReason(this.reason.id);
      return this.translate('commands.removeReason.messages.success', {
        reasonName: this.reason.name,
      });
    } catch (error) {
      return this.translate('commands.removeReason.errors.genericFailure', {
        reasonName: this.reason.name,
      });
    }
  }

  async handleComponentInteraction(interaction) {
    const content = await (() => {
      const buttonId = interaction.data.custom_id;
      switch (buttonId) {
        case noButtonId:
          return Promise.resolve(this.translate('common.canceled'));
        case yesButtonId:
          return this.removeReason();
      }
    })();
    this.markAsDone();
    return interaction.createMessage(content);
  }
}

class RemoveReasonCommand extends Command {
  constructor(translate) {
    super(translate, 'remove-reason', ApplicationCommandTypes.CHAT_INPUT);
  }

  initialize() {
    this.setDescription(this.translate('commands.removeReason.description'));
    this.addOption(new ReasonOption(reasonOptionId, this.translate('commands.removeReason.options.reason'), true));
    return Promise.resolve();
  }

  createInteractionHandler(client, dataModel, settings, translate, optionsValues) {
    return new RemoveReasonInteractionHandler(client, dataModel, settings, translate, optionsValues);
  }
}

module.exports = RemoveReasonCommand;
