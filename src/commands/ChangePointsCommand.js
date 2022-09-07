const ReasonOption = require('../options/ReasonOption');
const RecentlyGivenPointsOption = require('../options/RecentlyGivenPointsOption');
const {OptionId, UserOption, NumberOption} = require('../options/CommonOptions');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class ChangePointsInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.user = await this.findUser(interaction.guildID, this.getOptionValue(OptionId.User));
    this.pointsEntry = await this.dataModel.getPoints(this.getOptionValue(OptionId.RecentlyGivenPoints));
    this.reason = await this.dataModel.getReason(this.getOptionValue(OptionId.Reason));
    this.pointsValue = this.getOptionValue(OptionId.Points);
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.changePoints.messages.confirmation', {
        userName: this.user.username,
        points: this.pointsEntry.points,
        acquireDate: this.pointsEntry.acquireDate,
        reasonName: this.pointsEntry.reasonName,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changePoints(this.pointsEntry.id, this.pointsValue, this.reason.id);
        return this.translate('commands.changePoints.messages.success', {
          userName: this.user.username
        });
      } catch (error) {
        return this.translate('commands.changePoints.errors.failure', {
          userName: this.user.username
        });
      }
    });
  }
}

class ChangePointsCommand extends Command {
  constructor(translate) {
    super(translate, 'change-points');
  }

  initialize() {
    this.setDescription(this.translate('commands.changePoints.description'));
    this.addOption(new UserOption(this.translate('commands.changePoints.options.user')));
    this.addOption(new RecentlyGivenPointsOption(this.translate('commands.changePoints.options.recentlyGivenPoints')));
    this.addOption(new ReasonOption(this.translate('commands.changePoints.options.reason')));
    this.addOption(new NumberOption(OptionId.Points, this.translate('commands.changePoints.options.points')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangePointsInteractionHandler(...props);
  }
}

module.exports = ChangePointsCommand;
