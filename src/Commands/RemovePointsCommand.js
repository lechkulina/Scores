const {Constants: {ButtonStyles}} = require('eris');
const UserOption = require('../UserOption');
const RecentlyGivenPointsOption = require('../RecentlyGivenPointsOption');
const {OptionId} = require('../Options');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, actionRow, button} = require('../Components');

class RemovePointsInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.user = this.dataModel.getUser(this.getOptionValue(OptionId.User));
    this.pointsEntry = await this.dataModel.getPoints(this.getOptionValue(OptionId.RecentlyGivenPoints));
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.removePoints.messages.confirmation', {
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

  async removePoints() {
    try {
      await this.dataModel.removePoints(this.pointsEntry.id);
      return this.translate('commands.removePoints.messages.success', {
        userName: this.user.name,
      });
    } catch (error) {
      return this.translate('commands.removePoints.errors.failure', {
        userName: this.user.name,
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
          return this.removePoints();
      }
    })();
    return interaction.createMessage(content);
  }
}

class RemovePointsCommand extends Command {
  constructor(translate) {
    super(translate, 'remove-points');
  }

  initialize() {
    this.setDescription(this.translate('commands.removePoints.description'));
    this.addOption(new UserOption(this.translate('commands.removePoints.options.user')));
    this.addOption(new RecentlyGivenPointsOption(this.translate('commands.removePoints.options.recentlyGivenPoints')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemovePointsInteractionHandler(...props);
  }
}

module.exports = RemovePointsCommand;
