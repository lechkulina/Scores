const moment = require('moment');
const RecentlyGivenPointsOption = require('../options/RecentlyGivenPointsOption');
const {PointsValidator, UserValidator} = require('../validators/validators');
const {OptionId, UserOption} = require('../options/CommonOptions');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class RemovePointsInteractionHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.user = this.getOptionValue(OptionId.User);
    this.pointsEntry = this.getOptionValue(OptionId.RecentlyGivenPoints);
    const dateAndTimeOutputFormat = this.settings.get(SettingId.DateAndTimeOutputFormat);
    return interaction.createMessage({
      content: this.translate('commands.removePoints.messages.confirmation', {
        userName: this.user.username,
        points: this.pointsEntry.points,
        acquireDate: moment(this.pointsEntry.acquireDate).format(dateAndTimeOutputFormat),
        categoryName: this.pointsEntry.categoryName,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removePoints(this.pointsEntry.id);
        return this.translate('commands.removePoints.messages.success', {
          userName: this.user.username,
        });
      } catch (error) {
        return this.translate('commands.removePoints.errors.failure', {
          userName: this.user.username,
        });
      }
    });
  }
}

class RemovePointsCommand extends Command {
  constructor(...props) {
    super('remove-points', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removePoints.description'));
    this.addOptions([
      new UserOption(OptionId.User, this.translate('commands.removePoints.options.user')),
      new RecentlyGivenPointsOption(OptionId.RecentlyGivenPoints, OptionId.User, this.translate('commands.removePoints.options.recentlyGivenPoints'), this.dataModel, this.settings),
    ]);
    this.addValidators([
      new PointsValidator(OptionId.RecentlyGivenPoints, this.dataModel),
      new UserValidator(OptionId.User, this.clientHandler),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemovePointsInteractionHandler(...props);
  }
}

module.exports = RemovePointsCommand;
