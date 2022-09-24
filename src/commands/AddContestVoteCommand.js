const {OptionId, NumberOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const ContestEntryOption = require('../options/ContestEntryOption');
const AssignedContestVoteCategoriesOption = require('../options/AssignedContestVoteCategoriesOption');
const {
  ContestValidator,
  ContestEntryValidator,
  ContestVoteCategoryValidator,
  NumbersValuesValidator,
  ContestVoteScoreValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class AddContestVoteHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const contest = this.getOptionValue(OptionId.Contest);
    const entry = this.getOptionValue(OptionId.ContestEntry);
    const category = this.getOptionValue(OptionId.AssignedContestVoteCategory);
    const score = this.getOptionValue(OptionId.Score);
    try {
      const voter = await this.clientHandler.findMember(interaction.guildID, interaction.member.user.id);
      await this.dataModel.addUser(voter.user.id, voter.user.username, voter.user.discriminator, voter.guild.id);
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
      new ContestOption(ContestState.OpenForVoting, OptionId.Contest, this.translate('commands.addContestVote.options.contest'), this.dataModel),
      new ContestEntryOption(false, OptionId.ContestEntry, this.translate('commands.addContestVote.options.contestEntry'), this.dataModel),
      new AssignedContestVoteCategoriesOption(OptionId.AssignedContestVoteCategory, this.translate('commands.addContestVote.options.contestVoteCategory'), this.dataModel),
      new NumberOption(OptionId.Score, this.translate('commands.addContestVote.options.score')),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestEntryValidator(OptionId.ContestEntry, this.dataModel),
      new ContestVoteCategoryValidator(OptionId.AssignedContestVoteCategory, this.dataModel),
      new NumbersValuesValidator([OptionId.Score], this.options),
      new ContestVoteScoreValidator(OptionId.Score, OptionId.AssignedContestVoteCategory, this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestVoteHandler(...props);
  }
}

module.exports = AddContestVoteCommand;
