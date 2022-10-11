const InteractionHandler = require('../InteractionHandler');
const {Entities, joinSections} = require('../Formatters');
const Command = require('./Command');

class ShowRankingsHandler extends InteractionHandler {
  groupItemsPerRanks(items) {
    const ranks = new Map();
    items.forEach(({
      rank,
      translate,
    }) => {
      if (!ranks.has(rank)) {
        ranks.set(rank, {
          rank,
          items: [],
        })
      }
      const entry = ranks.get(rank);
      entry.items.push({
        translate,
      });
    });
    return Array.from(ranks.values());
  }

  generateHeaderSection(pointsSummary, contestsSummary) {
    const key = `commands.showRankings.messages.header.${
      pointsSummary.length > 0 || contestsSummary.length > 0
        ? 'withEntries'
        : 'withoutEntries'
    }`;
    return this.translate(key);
  }

  generateRankingsSections(pointsSummary, contestsSummary) {
    const sections = [];
    if (pointsSummary.length === 0 && contestsSummary.length === 0) {
      return sections;
    }
    const key = 'commands.showRankings.messages.rankings';
    const items = [];
    pointsSummary.forEach(({
      points,
      rank,
      userName,
      categoryName,
    }) => {
      items.push({
        rank,
        translate: () => (
          this.translate(`${key}.pointsItem`, {
            points,
            userName,
            categoryName,
          })
        )
      });
    });
    contestsSummary.forEach(({
      entryName,
      contestName,
      authorName,
      scores,
      rank,
    }) => {
      items.push({
        rank,
        translate: () => (
          this.translate(`${key}.contestItem`, {
            entryName,
            contestName,
            authorName,
            scores,
          })
        )
      });
    });
    const ranks = this.groupItemsPerRanks(items);
    ranks.forEach(({
      rank,
      items,
    }) => {
      if (items.length === 0) {
        return;
      }
      const subSections = [
        this.translate(`${key}.title`, {
          rank,
          itemsCount: items.length,
        })
      ];
      items.forEach(item => {
        subSections.push(item.translate());
      });
      sections.push(subSections.join(Entities.NewLine));
    });
    return sections;
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const guildId = interaction.guildID;
      const pointsSummary = await this.dataModel.getPointsRankingsSummary(guildId, 3);
      const contestsSummary = await this.dataModel.getContestsRankingsSummary(guildId, 3);
      return this.createLongMessage(interaction,
        joinSections([
          this.generateHeaderSection(pointsSummary, contestsSummary),
          ...this.generateRankingsSections(pointsSummary, contestsSummary),
        ], Entities.EmptyLine)
      );
    } catch (error) {
      console.error(`Failed to show rankings - got error`, error);
      return interaction.createMessage(this.translate('commands.showRankings.errors.failure'));
    }
  }
}

class ShowRankingsCommand extends Command {
  constructor(...props) {
    super('show-rankings', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.showRankings.description'));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ShowRankingsHandler(...props);
  }
}

module.exports = ShowRankingsCommand;
