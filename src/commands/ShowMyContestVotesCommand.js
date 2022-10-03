const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {ContestValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {Entities, joinSections} = require('../Formatters');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class ShowMyContestVotesHandler extends InteractionHandler {
  calculateAddedVotesCount(votesSummary) {
    return votesSummary.reduce((count, {score}) => {
      if (score != null) {
        count++;
      }
      return count;
    }, 0);
  }

  generateHeaderSection(contest, votesSummary, addedVotesCount) {
    const requiredVotesCount = votesSummary.length;
    const missingVotesCount = Math.max(0, requiredVotesCount - addedVotesCount);
    const addedVotesPercentage = requiredVotesCount > 0
      ? 100 * (addedVotesCount / requiredVotesCount)
      : 0;
    const key = `commands.showMyContestVotes.messages.${
      addedVotesCount > 0
      ? 'headerWithVotes'
      : 'headerWithoutVotes'
    }`;
    return this.translate(key, {
      contestName: contest.name,
      addedVotesPercentage,
      missingVotesCount,
    });
  }

  groupVotesEntries(votesSummary) {
    const votesEntries = new Map();
    votesSummary.forEach(({
      entryId,
      entryName,
      authorName,
      categoryName,
      score
    }) => {
      if (!votesEntries.has(entryId)) {
        votesEntries.set(entryId, {
          entryName,
          authorName,
          categories: [],
        })
      }
      const entry = votesEntries.get(entryId);
      entry.categories.push({
        categoryName,
        score,
      });
    });
    return Array.from(votesEntries.values());
  }

  generateVotesSections(votesSummary, addedVotesCount) {
    const sections = [];
    if (addedVotesCount === 0) {
      return sections;
    }
    const votesEntries = this.groupVotesEntries(votesSummary);
    if (votesEntries.length === 0) {
      return sections;
    }
    const key = 'commands.showMyContestVotes.messages.votes';
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
      ];
      categories.forEach(({categoryName, score}) => {
        subSections.push(
          this.translate(`${key}.${
            score == null
              ? 'itemWithoutScore'
              : 'itemWithScore'  
          }`, {
            categoryName,
            score,
          })
        );
      });
      sections.push(subSections.join(Entities.NewLine));
    });
    return sections;
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const userId = interaction.member.user.id;
      const contest = this.getOptionValue(OptionId.Contest);
      const votesSummary = await this.dataModel.getVoterContestVotesSummary(contest.id, userId);
      const addedVotesCount = this.calculateAddedVotesCount(votesSummary);
      return this.createLongMessage(interaction,
        joinSections([
          this.generateHeaderSection(contest, votesSummary, addedVotesCount),
          ...this.generateVotesSections(votesSummary, addedVotesCount)
        ], Entities.EmptyLine)
      );
    } catch (error) {
      console.error(`Failed to show contest votes - got error`, error);
      return interaction.createMessage(this.translate('commands.showMyContestVotes.errors.failure'));
    }
  }
}

class ShowMyContestVotesCommand extends Command {
  constructor(...props) {
    super('show-my-contest-votes', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.showMyContestVotes.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('commands.showMyContestVotes.options.contest'), this.dataModel),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ShowMyContestVotesHandler(...props);
  }
}

module.exports = ShowMyContestVotesCommand;
