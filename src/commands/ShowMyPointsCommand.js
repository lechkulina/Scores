const moment = require('moment');
const InteractionHandler = require('../InteractionHandler');
const {Entities} = require('../Formatters');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class ShowMyPointsInteractionHandler extends InteractionHandler {
  generateHeaderSection(accumulatedSummary) {
    const {points, minAcquireDate, maxAcquireDate} = accumulatedSummary;
    const dateOutputFormat = this.settings.get(SettingId.DateOutputFormat);
    return points > 0
      ? this.translate('commands.showMyPoints.messages.headerWithPoints', {
          points,
          minAcquireDate: moment(minAcquireDate).format(dateOutputFormat),
          maxAcquireDate: moment(maxAcquireDate).format(dateOutputFormat),
        })
      : this.translate('commands.showMyPoints.messages.headerWithoutPoints');
  }

  generateRecentlyGivenSection(recentlyGivenSummary) {
    if (recentlyGivenSummary.length === 0) {
      return '';
    }
    const sections = [
      this.translate('commands.showMyPoints.messages.recentlyGivenDescription')
    ];
    const dateAndTimeOutputFormat = this.settings.get(SettingId.DateAndTimeOutputFormat);
    recentlyGivenSummary.forEach(({points, acquireDate, giverName, reasonName}) => {
      sections.push(
        this.translate('commands.showMyPoints.messages.recentlyGivenEntry', {
          points,
          acquireDate: moment(acquireDate).format(dateAndTimeOutputFormat),
          giverName,
          reasonName,
        })
      );
    });
    return sections.join(Entities.NewLine);
  }

  generateRankingsSection(rankingsSummary) {
    if (rankingsSummary.length === 0) {
      return '';
    }
    const sections = [
      this.translate('commands.showMyPoints.messages.rankingsDescription')
    ];
    rankingsSummary.forEach(({rankingPosition, points, reasonName}) => {
      sections.push(
        this.translate('commands.showMyPoints.messages.rankingsEntry', {
          rankingPosition,
          points,
          reasonName,
        })
      );
    });
    return sections.join(Entities.NewLine);
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const userId = interaction.member.user.id;
      const recentPointsLimit = this.settings.get(SettingId.RecentPointsLimit);
      const accumulatedSummary = await this.dataModel.getPointsAccumulatedSummary(userId);
      const recentlyGivenSummary = await this.dataModel.getPointsRecentlyGivenSummary(userId, recentPointsLimit);
      const rankingsSummary = await this.dataModel.getPointsRankingsSummary(userId);
      return this.createLongMessage(interaction, 
        [
          this.generateHeaderSection(accumulatedSummary),
          this.generateRecentlyGivenSection(recentlyGivenSummary),
          this.generateRankingsSection(rankingsSummary),
        ]
          .filter(section => !!section)
          .join(Entities.EmptyLine)
      );
    } catch (error) {
      console.error(`Failed to show points - got error`, error);
      return interaction.createMessage(this.translate('commands.showMyPoints.errors.failure'));
    }
  }
}

class ShowMyPointsCommand extends Command {
  constructor(...props) {
    super('show-my-points', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.showMyPoints.description'));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ShowMyPointsInteractionHandler(...props);
  }
}

module.exports = ShowMyPointsCommand;
