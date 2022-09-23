const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {ContestValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {Entities} = require('../Formatters');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class ShowMyContestVotesHandler extends InteractionHandler {
  calculateMissingVotesCount(votesSummary) {
    return votesSummary.reduce((count, {score}) => {
      if (score == null) {
        count++;
      }
      return count;
    }, 0);
  }

  generateHeaderSection(contest, votesSummary) {
    const votesCount = votesSummary.length;
    const missingVotesCount = this.calculateMissingVotesCount(votesSummary);
    const addedVotesPercentage = votesCount > 0 ? 100 * (votesCount - missingVotesCount) / votesCount : 0;
    return this.translate('commands.showMyContestVotes.messages.header', {
      contestName: contest.name,
      addedVotesPercentage,
      missingVotesCount,
    })
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
    const sections = [];
    votesEntries.forEach(({entryName, authorName, categories}) => {
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
      return this.createLongMessage(interaction,
        [
          this.generateHeaderSection(contest, votesSummary),
          ...this.generateVotesSections(votesSummary),
        ]
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
