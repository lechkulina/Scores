const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {ContestValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {Entities, joinSections} = require('../Formatters');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class ShowContestVotesSummaryHandler extends InteractionHandler {
  calculateCompletedVotingsCount(votersSummary) {
    return votersSummary.reduce((count, {votesCount, entriesCount, categoriesCount}) => {
      const requiredVotesCount = entriesCount * categoriesCount;
      if (requiredVotesCount === votesCount) {
        count++;
      }
      return count;
    }, 0);
  }

  generateHeaderSection(contest, votersSummary) {
    const completedVotingsCount = this.calculateCompletedVotingsCount(votersSummary);
    const missingVotingsCount = Math.max(0, contest.requiredCompletedVotingsCount - completedVotingsCount);
    const key = `commands.showContestVotes.messages.header.${
      votersSummary.length > 0
        ? 'withVotings'
        : 'withoutVotings'
    }`;
    return this.translate(key, {
      contestName: contest.name,
      completedVotingsCount,
      missingVotingsCount,
    });
  }

  groupVotersEntries(votersSummary) {
    return votersSummary.map(({
      voterName,
      votesCount,
      entriesCount,
      categoriesCount
    }) => {
      const requiredVotesCount = entriesCount * categoriesCount;
      const requiredVotesPercentage = requiredVotesCount > 0 ? (votesCount / requiredVotesCount) * 100 : 0;
      return {
        voterName,
        votesCount,
        requiredVotesPercentage,
      };
    });
  }

  generateVotersSection(votersSummary) {
    const votersEntries = this.groupVotersEntries(votersSummary);
    if (votersEntries.length === 0) {
      return;
    }
    const key = 'commands.showContestVotes.messages.voters';
    const sections = [
      this.translate(`${key}.title`, {
        count: votersSummary.length,
      })
    ];
    votersEntries.forEach(({
      voterName,
      votesCount,
      requiredVotesPercentage
    }) => {
      sections.push(
        this.translate(`${key}.item`, {
          voterName,
          votesCount,
          requiredVotesPercentage,
        })
      );
    });
    return sections.join(Entities.NewLine);
  }

  groupVotesEntries(votesSummary) {
    const votesEntries = new Map();
    votesSummary.forEach(({
      entryId,
      entryName,
      authorName,
      categoryName,
      scores,
      votesCount
    }) => {
      if (!votesEntries.has(entryId)) {
        votesEntries.set(entryId, {
          entryName,
          authorName,
          categories: [],
        });
      }
      const votesEntry = votesEntries.get(entryId);
      votesEntry.categories.push({
        categoryName,
        votesCount,
        scores,
      });
    });
    return Array.from(votesEntries.values());
  }

  async generateVotesSections(contest, votersSummary) {
    const sections = [];
    if (votersSummary.length === 0) {
      return sections;
    }
    const votesSummary = await this.dataModel.getContestVotesSummary(contest.id);
    const votesEntries = this.groupVotesEntries(votesSummary);
    if (votesEntries.length === 0) {
      return sections;
    }
    const key = 'commands.showContestVotes.messages.votes';
    votesEntries.forEach(({
      entryName,
      authorName,
      categories
    }) => {
      if (categories.length === 0) {
        return;
      }
      const subSections = [
        this.translate(`${key}.title`, {
          entryName,
          authorName,
        })
      ]
      categories.forEach(({
        categoryName,
        votesCount,
        scores
      }) => {
        subSections.push(
          this.translate(`${key}.${
            scores == null
              ? 'itemWithoutScore'
              : 'itemWithScore'
          }`, {
            categoryName,
            votesCount,
            scores,
          })
        )
      });
      sections.push(subSections.join(Entities.NewLine));
    });
    return sections;
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const contest = this.getOptionValue(OptionId.Contest);
      const votersSummary = await this.dataModel.getContestVotersSummary(contest.id); 
      return this.createLongMessage(interaction,
        joinSections([
          this.generateHeaderSection(contest, votersSummary),
          this.generateVotersSection(votersSummary),
          ...(await this.generateVotesSections(contest, votersSummary)),
        ], Entities.EmptyLine)
      );
    } catch (error) {
      console.error(`Failed to show contest votes - got error`, error);
      return interaction.createMessage(this.translate('commands.showContestVotes.errors.failure'));
    }
  }
}

class ShowContestVotesSummaryCommand extends Command {
  constructor(...props) {
    super('show-contest-votes', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.showContestVotes.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('commands.showContestVotes.options.contest'), this.dataModel),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ShowContestVotesSummaryHandler(...props);
  }
}

module.exports = ShowContestVotesSummaryCommand;
