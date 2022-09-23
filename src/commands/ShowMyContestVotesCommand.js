const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {ContestValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {Entities} = require('../Formatters');
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
    const requiredvotesCount = votesSummary.length;
    const missingVotesCount = Math.max(0, requiredvotesCount - addedVotesCount);
    const addedVotesPercentage = requiredvotesCount > 0 ? 100 * (addedVotesCount / requiredvotesCount) : 0;
    return addedVotesCount > 0
      ? this.translate('commands.showMyContestVotes.messages.headerWithVotes', {
          contestName: contest.name,
          addedVotesPercentage,
          missingVotesCount,
        })
      : this.translate('commands.showMyContestVotes.messages.headerWithoutVotes', {
          contestName: contest.name,
        });
  }

  groupVotesEntries(votesSummary) {
    const votesEntries = new Map();
    votesSummary.forEach(({entryId, entryName, authorName, categoryName, score}) => {
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

  generateVotesSections(votesSummary) {
    const votesEntries = this.groupVotesEntries(votesSummary);
    if (votesEntries.length === 0) {
      return '';
    }
    const sections = [];
    votesEntries.forEach(({entryName, authorName, categories}) => {
      if (categories.length === 0) {
        return;
      }
      const subSections = [
        this.translate('commands.showMyContestVotes.messages.votesDescription', {
          entryName,
          authorName,
        })
      ];
      categories.forEach(({categoryName, score}) => {
        subSections.push(
          score == null
            ? this.translate('commands.showMyContestVotes.messages.voteDescriptionWithoutScore', {
                categoryName,
              })
            : this.translate('commands.showMyContestVotes.messages.voteDescriptionWithScore', {
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
      const contest = this.getOptionValue(OptionId.Contest);
      const votesSummary = await this.dataModel.getVoterContestVotesSummary(contest.id, interaction.member.user.id);
      const addedVotesCount = this.calculateAddedVotesCount(votesSummary);
      const sections = [
        this.generateHeaderSection(contest, votesSummary, addedVotesCount),
      ];
      if (addedVotesCount > 0) {
        sections.push(
          ...this.generateVotesSections(votesSummary)
        );
      }
      return this.createLongMessage(interaction,
        sections
          .filter(section => !!section)
          .join(Entities.EmptyLine)
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
