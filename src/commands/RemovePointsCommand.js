const RecentlyGivenPointsOption = require('../options/RecentlyGivenPointsOption');
const {OptionId, UserOption} = require('../options/CommonOptions');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RemovePointsInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.user = await this.findUser(interaction.guildID, this.getOptionValue(OptionId.User));
    this.pointsEntry = await this.dataModel.getPoints(this.getOptionValue(OptionId.RecentlyGivenPoints));
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.removePoints.messages.confirmation', {
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
      new UserOption(this.translate('commands.removePoints.options.user')),
      new RecentlyGivenPointsOption(this.translate('commands.removePoints.options.recentlyGivenPoints')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemovePointsInteractionHandler(...props);
  }
}

module.exports = RemovePointsCommand;
