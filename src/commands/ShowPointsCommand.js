const InteractionHandler = require('../InteractionHandler');
const {Entities, formatMessageTable} = require('../Formatters');
const Command = require('./Command');

class ShowPointsInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.user = await this.findUser(interaction.guildID, interaction.member.user.id);
  }

  async handleCommandInteraction(interaction) {
    try {
      const recentPointsLimit = await this.settings.get('recentPointsLimit');
      const summary = await this.dataModel.getPointsSummary(this.user.id);
      const recentPointsRows = await this.dataModel.getRecentPoints(this.user.id, recentPointsLimit);
      const rankingPositionsRows = await this.dataModel.getRankingPositions(this.user.id);
      this.markAsDone();
      return interaction.createMessage({
        content: [
          this.translate('commands.showPoints.messages.summary', {
            points: summary.points,
            minAcquireDate: summary.minAcquireDate,
            maxAcquireDate: summary.maxAcquireDate,
          }),
          formatMessageTable({
            rows: recentPointsRows,
            columnsOrder: ['acquireDate', 'points', 'giverName', 'reasonName'],
            columnsLabels: {
              acquireDate: this.translate('common.acquireDate'),
              points: this.translate('common.points'),
              giverName: this.translate('common.giverName'),
              reasonName: this.translate('common.reasonName'),
            },
            message: this.translate('commands.showPoints.messages.recentPoints', {
              pointsCount: Math.min(recentPointsLimit, summary.pointsCount),
            }),
          }),
          formatMessageTable({
            rows: rankingPositionsRows,
            columnsOrder: ['rankingPosition', 'points', 'reasonName'],
            columnsLabels: {
              rankingPosition: this.translate('common.rankingPosition'),
              points: this.translate('common.points'),
              reasonName: this.translate('common.reasonName'),
            },
            message: this.translate('commands.showPoints.messages.rankingPositions', {
              pointsCount: summary.pointsCount,
            }),
          }),
        ].join(Entities.NewLine),
      });
    } catch (error) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.showPoints.errors.failure', {
        userName: user.username,
      }));
    }
  }
}

class ShowPointsCommand extends Command {
  constructor(translate) {
    super(translate, 'show-points');
  }

  initialize() {
    this.setDescription(this.translate('commands.showPoints.description'));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ShowPointsInteractionHandler(...props);
  }
}

module.exports = ShowPointsCommand;
