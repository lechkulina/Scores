const {OptionId, NumberOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const ContestEntryOption = require('../options/ContestEntryOption');
const AssignedContestVoteCategoriesOption = require('../options/AssignedContestVoteCategoriesOption');
const {ContestValidator, ContestEntryValidator, ContestVoteCategoryValidator, NumbersValuesValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class AddContestVoteHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const voter = await this.clientHandler.findMember(interaction.guildID, interaction.member.user.id);
    const [contest, entry, category, score] = this.getOptionValues([
      OptionId.Contest,
      OptionId.ContestEntry,
      OptionId.AssignedContestVoteCategory,
      OptionId.Score,
    ]);
    try {
      await this.dataModel.addContestVote(contest.id, entry.id, category.id, voter.id, score);
      return interaction.createMessage(
        this.translate('commands.addContestVote.messages.success', {
          entryName: entry.name,
          contestName: contest.name,
          categoryName: category.name,
        })
      );
    } catch (error) {
      return interaction.createMessage(
        this.translate('commands.addContestVote.errors.failure', {
          entryName: entry.name,
          contestName: contest.name,
          categoryName: category.name,
        })
      );
    }
  }
}

class AddContestVoteCommand extends Command {
  constructor(...props) {
    super('add-contest-vote', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addContestVote.description'));
    this.addOptions([
      new ContestOption(ContestState.OpenForVoting, OptionId.Contest, this.translate('commands.addContestVote.options.contest')),
      new ContestEntryOption(false, OptionId.ContestEntry, this.translate('commands.addContestVote.options.contestEntry')),
      new AssignedContestVoteCategoriesOption(OptionId.AssignedContestVoteCategory, this.translate('commands.addContestVote.options.contestVoteCategory')),
      new NumberOption(OptionId.Score, this.translate('commands.addContestVote.options.score')),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestEntryValidator(OptionId.ContestEntry, this.dataModel),
      new ContestVoteCategoryValidator(OptionId.AssignedContestVoteCategory, this.dataModel),
      new NumbersValuesValidator([OptionId.Score], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestVoteHandler(...props);
  }
}

module.exports = AddContestVoteCommand;
