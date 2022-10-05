const moment = require('moment');
const PointsCategoryOption = require('../options/PointsCategoryOption');
const RecentlyGivenPointsOption = require('../options/RecentlyGivenPointsOption');
const {OptionId, UserOption, NumberOption} = require('../options/CommonOptions');
const {
  PointsValueValidator,
  PointsCategoryValidator, 
  PointsValidator,
  UserValidator,
 } = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class ChangePointsInteractionHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.user = this.getOptionValue(OptionId.User);
    this.pointsEntry = this.getOptionValue(OptionId.RecentlyGivenPoints);
    const dateAndTimeOutputFormat = this.settings.get(SettingId.DateAndTimeOutputFormat);
    return interaction.createMessage({
      content: this.translate('commands.changePoints.messages.confirmation', {
        userName: this.user.username,
        points: this.pointsEntry.points,
        acquireDate: moment(this.pointsEntry.acquireDate).format(dateAndTimeOutputFormat),
        categoryName: this.pointsEntry.categoryName,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const category = this.getOptionValue(OptionId.PointsCategory);
    const pointsValue = this.getOptionValue(OptionId.Points);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changePoints(this.pointsEntry.id, pointsValue, category.id);
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
      new RecentlyGivenPointsOption(OptionId.RecentlyGivenPoints, OptionId.User, this.translate('commands.changePoints.options.recentlyGivenPoints'), this.dataModel, this.settings),
      new PointsCategoryOption(OptionId.PointsCategory, this.translate('commands.changePoints.options.pointsCategory'), this.dataModel),
      new NumberOption(OptionId.Points, this.translate('commands.changePoints.options.points')),
    ]);
    this.addValidators([
      new PointsCategoryValidator(OptionId.PointsCategory, this.dataModel),
      new PointsValidator(OptionId.RecentlyGivenPoints, this.dataModel),
      new UserValidator(OptionId.User, this.clientHandler),
      new PointsValueValidator(OptionId.Points, OptionId.PointsCategory, this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangePointsInteractionHandler(...props);
  }
}

module.exports = ChangePointsCommand;
