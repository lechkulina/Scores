const ReasonOption = require('../options/ReasonOption');
const RecentlyGivenPointsOption = require('../options/RecentlyGivenPointsOption');
const {OptionId, UserOption, NumberOption} = require('../options/CommonOptions');
const {PointsValueValidator, ReasonValidator, PointsValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class ChangePointsInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.user = await this.clientHandler.findUser(interaction.guildID, this.getOptionValue(OptionId.User));
    this.pointsEntry = this.getOptionValue(OptionId.RecentlyGivenPoints);
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
    const [reason, pointsValue] = this.getOptionValues([OptionId.Reason, OptionId.Points]);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changePoints(this.pointsEntry.id, pointsValue, reason.id);
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
  constructor(...props) {
    super('change-points', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changePoints.description'));
    this.addOptions([
      new UserOption(OptionId.User, this.translate('commands.changePoints.options.user')),
      new RecentlyGivenPointsOption(OptionId.RecentlyGivenPoints, this.translate('commands.changePoints.options.recentlyGivenPoints')),
      new ReasonOption(OptionId.Reason, this.translate('commands.changePoints.options.reason')),
      new NumberOption(OptionId.Points, this.translate('commands.changePoints.options.points')),
    ]);
    this.addValidators([
      new PointsValueValidator(OptionId.Points, OptionId.Reason, this.dataModel, this.options),
      new ReasonValidator(OptionId.Reason, this.dataModel),
      new PointsValidator(OptionId.RecentlyGivenPoints, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangePointsInteractionHandler(...props);
  }
}

module.exports = ChangePointsCommand;
