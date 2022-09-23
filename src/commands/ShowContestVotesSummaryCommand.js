const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {ContestValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {Entities} = require('../Formatters');
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
    return  this.translate('commands.showContestVotesSummary.messages.header', {
      contestName: contest.name,
      completedVotingsCount,
      missingVotingsCount,
    });
  }

  groupVotersEntries(votersSummary) {
    return votersSummary.map(({voterName, votesCount, entriesCount, categoriesCount}) => {
      const requiredVotesCount = entriesCount * categoriesCount;
      const requiredVotesPercentage = (votesCount / requiredVotesCount) * 100;
      return {
        voterName,
        votesCount,
        requiredVotesPercentage,
      };
    });
  }

  generateVotersSection(votersSummary) {
    const votersEntries = this.groupVotersEntries(votersSummary);
    const sections = [
      this.translate('commands.showContestVotesSummary.messages.votersDescription', {
        count: votersSummary.length,
      })
    ];
    votersEntries.forEach(({voterName, votesCount, requiredVotesPercentage}) => {
      sections.push(
        this.translate('commands.showContestVotesSummary.messages.voterDescription', {
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
    votesSummary.forEach(({entryId, entryName, authorName, categoryName, scores, votesCount}) => {
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
        scores: scores ?? 0,
      });
    });
    return Array.from(votesEntries.values());
  }

  generateVotesSections(votesSummary) {
    const votesEntries = this.groupVotesEntries(votesSummary);
    const sections = [];
    votesEntries.forEach(({entryName, authorName, categories}) => {
      const subSections = [
        this.translate('commands.showContestVotesSummary.messages.votesDescription', {
          entryName,
          authorName,
        })
      ]
      categories.forEach(({categoryName, votesCount, scores}) => {
        subSections.push(
          scores === 0
            ? this.translate('commands.showContestVotesSummary.messages.voteDescriptionWithoutScore', {
                categoryName,
              })
            : this.translate('commands.showContestVotesSummary.messages.voteDescriptionWithScore', {
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
      const votesSummary = await this.dataModel.getContestVotesSummary(contest.id);
      return this.createLongMessage(interaction,
        [
          this.generateHeaderSection(contest, votersSummary),
          this.generateVotersSection(votersSummary),
          ...this.generateVotesSections(votesSummary),
        ]
          .filter(section => !!section)
          .join(Entities.EmptyLine)
      );
    } catch (error) {
      console.error(`Failed to show contest votes - got error`, error);
      return interaction.createMessage(this.translate('commands.showContestVotesSummary.errors.failure'));
    }
  }
}

class ShowContestVotesSummaryCommand extends Command {
  constructor(...props) {
    super('show-contest-votes-summary', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.showContestVotesSummary.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('commands.showContestVotesSummary.options.contest')),
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
