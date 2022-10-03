const moment = require('moment');
const InteractionHandler = require('../InteractionHandler');
const {Entities, joinSections} = require('../Formatters');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class ShowMyPointsInteractionHandler extends InteractionHandler {
  async generateHeaderSection(guildId, userId, contestVotesSummary) {
    const pointsSummary = await this.dataModel.getUserAccumulatedPointsSummary(guildId, userId);
    if (!pointsSummary && contestVotesSummary.length === 0) {
      return;
    }
    let {points, minAcquireDate, maxAcquireDate} = pointsSummary;
    contestVotesSummary.forEach(({scores, votingEndDate}) => {
      points += scores;
      minAcquireDate = minAcquireDate ? Math.min(minAcquireDate, votingEndDate) : votingEndDate;
      maxAcquireDate = maxAcquireDate ? Math.max(maxAcquireDate, votingEndDate) : votingEndDate;
    });
    minAcquireDate = minAcquireDate || maxAcquireDate;
    const dateOutputFormat = this.settings.get(SettingId.DateOutputFormat);
    const key = `commands.showMyPoints.messages.header.${
      points > 0
        ? minAcquireDate === maxAcquireDate
          ? 'withPointsDay'
          : 'withPointsDatesRange'
        : 'withoutPoints'
    }`;
    return this.translate(key, {
      points,
      minAcquireDate: moment(minAcquireDate).format(dateOutputFormat),
      maxAcquireDate: moment(maxAcquireDate).format(dateOutputFormat),
    });
  }

  async generateRankingsSection(guildId, userId) {
    const pointsSummary = await this.dataModel.getUserPointsRankingsSummary(guildId, userId);
    const contestsSummary = await this.dataModel.getUserContestsRankingsSummary(guildId, userId);
    if (pointsSummary.length === 0 && contestsSummary.length === 0) {
      return;
    }
    const key = 'commands.showMyPoints.messages.rankings';
    const items = [];
    pointsSummary.forEach(({
      points,
      categoryName,
      rank,
    }) => {
      items.push({
        rank,
        translate: () => (
          this.translate(`${key}.pointsItem`, {
            points,
            categoryName,
            rank,
          })
        )
      });
    });
    contestsSummary.forEach(({
      entryName,
      contestName,
      scores,
      rank,
    }) => {
      items.push({
        rank,
        translate: () => (
          this.translate(`${key}.contestItem`, {
            entryName,
            contestName,
            scores,
            rank,
          })
        )
      });
    });
    const sections = [
      this.translate(`${key}.title`)
    ];
    items
      .sort((left, right) => left.rank - right.rank)
      .forEach(item => {
        sections.push(item.translate());
      });
    return sections.join(Entities.NewLine);
  }

  async generateRecentlyGivenSection(guildId, userId, contestVotesSummary) {
    const limit = this.settings.get(SettingId.RecentlyGivenPointsLimit);
    const pointsSummary = await this.dataModel.getUserRecentlyGivenPointsSummary(guildId, userId, limit);
    if (pointsSummary.length === 0 && contestVotesSummary.length === 0) {
      return;
    }
    const key = 'commands.showMyPoints.messages.recentlyGiven';
    const dateAndTimeOutputFormat = this.settings.get(SettingId.DateAndTimeOutputFormat);
    const items = [];
    pointsSummary.forEach(({
      points,
      acquireDate,
      giverName,
      categoryName
    }) => {
      items.push({
        date: acquireDate,
        translate: () => (
          this.translate(`${key}.pointsItem`, {
            points,
            acquireDate: moment(acquireDate).format(dateAndTimeOutputFormat),
            giverName,
            categoryName,
          })
        )
      });
    });
    contestVotesSummary.forEach(({
      entryName,
      submitDate,
      contestName,
      votingEndDate,
      scores
    }) => {
      items.push({
        date: votingEndDate,
        translate: () => (
          this.translate(`${key}.votesItem`, {
            entryName,
            contestName,
            scores,
            submitDate: moment(submitDate).format(dateAndTimeOutputFormat),
            votingEndDate: moment(votingEndDate).format(dateAndTimeOutputFormat),
          })
        )
      });
    });
    const sections = [];
    items
      .sort((left, right) => right.date - left.date)
      .slice(0, limit)
      .forEach(item => {
        sections.push(item.translate());
      });
    sections.unshift(
      this.translate(`${key}.title`, {
        itemsCount: items.length,
      })
    );
    return sections.join(Entities.NewLine);
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const guildId = interaction.guildID;
      const userId = interaction.member.user.id;
      const contestVotesSummary = await this.dataModel.getUserContestsVotesSummary(guildId, userId);
      return this.createLongMessage(interaction,
        joinSections([
          await this.generateHeaderSection(guildId, userId, contestVotesSummary),
          await this.generateRankingsSection(guildId, userId),
          await this.generateRecentlyGivenSection(guildId, userId, contestVotesSummary),
        ], Entities.EmptyLine)
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
