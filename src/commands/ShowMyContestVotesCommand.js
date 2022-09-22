const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {ContestValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {Entities, formatMessageTable} = require('../Formatters');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class ShowMyContestVotesHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const contest = this.getOptionValue(OptionId.Contest);
      const votes = await this.dataModel.getContestVotes(contest.id, interaction.member.user.id);
      const entries = new Map();
      let missingVotesCount = 0;
      votes.forEach(vote => {
        if (!entries.has(vote.entryId)) {
          entries.set(vote.entryId, {
            entryName: vote.entryName,
            authorName: vote.authorName,
            categories: [],
          })
        }
        const entry = entries.get(vote.entryId);
        if (vote.score == null) {
          missingVotesCount++;
        }
        entry.categories.push({
          categoryName: vote.categoryName,
          score: vote.score ?? this.translate('commands.showMyContestVotes.messages.noScore'),
        });
      });
      // summary
      const votesCount = votes.length;
      const addedVotesPercentage = votesCount > 0 ? 100 * (votesCount - missingVotesCount) / votesCount : 0;
      const sections = [];
      sections.push(
        this.translate('commands.showMyContestVotes.messages.summary', {
          contestName: contest.name,
          addedVotesPercentage,
          count: missingVotesCount,
        })
      );
      // entries
      if (votesCount > 0) {
        const columnsOrder = ['categoryName', 'score'];
        const columnsLabels = {
          categoryName: this.translate('common.category'),
          score: this.translate('commands.showMyContestVotes.messages.score'),
        };
        Array.from(entries.values()).forEach(({entryName, authorName, categories}) => {
          sections.push(
            formatMessageTable({
              message: this.translate('commands.showMyContestVotes.messages.entryHeader', {
                entryName,
                authorName,
              }),
              rows: categories,
              columnsOrder,
              columnsLabels
            })
          );
        });
      }
      return this.createLongMessage(interaction, sections.join(Entities.NewLine));
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
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('commands.showMyContestVotes.options.contest')),
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
