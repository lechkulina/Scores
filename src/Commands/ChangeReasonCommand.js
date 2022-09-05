const {Constants: {ButtonStyles}} = require('eris');
const {OptionId, StringOption, NumberOption} = require('../Options');
const ReasonOption = require('../ReasonOption');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, actionRow, button} = require('../Components');

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
      return interaction.createMessage(this.translate('commands.addReason.errors.invalidName'));
    }
    if (this.min >= this.max) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.addReason.errors.invalidRange', {
        min: this.min,
        max: this.max,
      }));
    }
    return interaction.createMessage({
      content: this.translate('commands.changeReason.messages.confirmation', {
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

  async changeReason() {
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
  }

  async handleComponentInteraction(interaction) {
    this.markAsDone();
    const content = await (() => {
      const buttonId = interaction.data.custom_id;
      switch (buttonId) {
        case ButtonId.No:
          return Promise.resolve(this.translate('common.canceled'));
        case ButtonId.Yes:
          return this.changeReason();
      }
    })();
    return interaction.createMessage(content);
  }
}

class ChangeReasonCommand extends Command {
  constructor(translate) {
    super(translate, 'change-reason');
  }

  initialize() {
    this.setDescription(this.translate('commands.changeReason.description'));
    this.addOption(new ReasonOption(this.translate('commands.removeReason.options.reason')));
    this.addOption(new StringOption(OptionId.Name, this.translate('commands.addReason.options.name')));
    this.addOption(new NumberOption(OptionId.Min, this.translate('commands.addReason.options.min')));
    this.addOption(new NumberOption(OptionId.Max, this.translate('commands.addReason.options.max')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeReasonInteractionHandler(...props);
  }
}

module.exports = ChangeReasonCommand;
