const {Constants: {ButtonStyles}} = require('eris');
const ReasonOption = require('../ReasonOption');
const {OptionId, NumberOption} = require('../Options');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, actionRow, button} = require('../Components');
const UserOption = require('../UserOption');
const RecentlyGivenPointsOption = require('../RecentlyGivenPointsOption');

class ChangePointsInteractionHandler extends InteractionHandler {
  async initialize() {
    this.user = this.dataModel.getUser(this.getOptionValue(OptionId.User));
    this.pointsEntry = await this.dataModel.getPoints(this.getOptionValue(OptionId.RecentlyGivenPoints));
    this.reason = await this.dataModel.getReason(this.getOptionValue(OptionId.Reason));
    this.pointsValue = this.getOptionValue(OptionId.Points);
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.changePoints.messages.confirmation', {
        userName: this.user.name,
        points: this.pointsEntry.points,
        acquireDate: this.pointsEntry.acquireDate,
        reasonName: this.pointsEntry.reasonName,
      }),
      components: [
        actionRow([
          button(ButtonId.No, this.translate('common.no')),
          button(ButtonId.Yes, this.translate('common.yes'), ButtonStyles.DANGER),
        ]),
      ],
    });
  }

  async changePoints() {
    try {
      await this.dataModel.changePoints(this.pointsEntry.id, this.pointsValue, this.reason.id);
      return this.translate('commands.changePoints.messages.success', {
        userName: this.user.name
      });
    } catch (error) {
      return this.translate('commands.changePoints.errors.failure', {
        userName: this.user.name
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
          return this.changePoints();
      }
    })();
    return interaction.createMessage(content);
  }
}

class ChangePointsCommand extends Command {
  constructor(translate) {
    super(translate, 'change-points');
  }

  initialize() {
    this.setDescription(this.translate('commands.changePoints.description'));
    this.addOption(new UserOption(this.translate('commands.changePoints.options.user')));
    this.addOption(new RecentlyGivenPointsOption(this.translate('commands.removePoints.options.recentlyGivenPoints')));
    this.addOption(new ReasonOption(this.translate('commands.addPoints.options.reason')));
    this.addOption(new NumberOption(OptionId.Points, this.translate('commands.addPoints.options.points')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangePointsInteractionHandler(...props);
  }
}

module.exports = ChangePointsCommand;
