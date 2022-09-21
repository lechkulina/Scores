const {OptionId, NumberOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const ContestVoteOption = require('../options/ContestVoteOption');
const ContestEntryOption = require('../options/ContestEntryOption');
const {ContestValidator, ContestEntryValidator, NumbersValuesValidator, ContestVoteValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class ChangeContestVoteHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.entry = this.getOptionValue(OptionId.ContestEntry);
    this.vote = this.getOptionValue(OptionId.ContestVote);
    this.translateOptions = {
      score: this.vote.score,
      categoryName: this.vote.categoryName,
      entryName: this.entry.name,
    };
    return interaction.createMessage({
      content: this.translate('commands.changeContestVote.messages.confirmation', this.translateOptions),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const score = this.getOptionValue(OptionId.Score);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContestVote(this.vote.id, this.entry.contestId, score);
        return this.translate('commands.changeContestVote.messages.success', this.translateOptions);
      } catch (error) {
        return this.translate('commands.changeContestVote.errors.failure', this.translateOptions);
      }
    });
  }
}

class ChangeContestVoteCommand extends Command {
  constructor(...props) {
    super('change-contest-vote', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changeContestVote.description'));
    this.addOptions([
      new ContestOption(ContestState.OpenForVoting, OptionId.Contest, this.translate('commands.changeContestVote.options.contest')),
      new ContestEntryOption(false, OptionId.ContestEntry, this.translate('commands.changeContestVote.options.contestEntry')),
      new ContestVoteOption(true, OptionId.ContestVote, this.translate('commands.changeContestVote.options.contestVote')),
      new NumberOption(OptionId.Score, this.translate('commands.changeContestVote.options.score')),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestEntryValidator(OptionId.ContestEntry, this.dataModel),
      new ContestVoteValidator(OptionId.ContestVote, this.dataModel),
      new NumbersValuesValidator([OptionId.Score], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeContestVoteHandler(...props);
  }
}

module.exports = ChangeContestVoteCommand;
