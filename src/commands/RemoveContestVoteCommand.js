const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const ContestEntryOption = require('../options/ContestEntryOption');
const ContestVoteOption = require('../options/ContestVoteOption');
const {ContestValidator, ContestEntryValidator, ContestVoteValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class RemoveContestVoteHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.entry = this.getOptionValue(OptionId.ContestEntry);
    this.vote = this.getOptionValue(OptionId.ContestVote);
    this.translateOptions = {
      score: this.vote.score,
      categoryName: this.vote.categoryName,
      entryName: this.entry.name,
    };
    return interaction.createMessage({
      content: this.translate('commands.removeContestVote.messages.confirmation', this.translateOptions),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removeContestVote(this.vote.id, this.entry.contestId);
        return this.translate('commands.removeContestVote.messages.success', this.translateOptions);
      } catch (error) {
        return this.translate('commands.removeContestVote.errors.failure', this.translateOptions);
      }
    });
  }
}

class RemoveContestVoteCommand extends Command {
  constructor(...props) {
    super('remove-contest-vote', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removeContestVote.description'));
    this.addOptions([
      new ContestOption(ContestState.OpenForVoting, OptionId.Contest, this.translate('commands.removeContestVote.options.contest'), this.dataModel),
      new ContestEntryOption(false, OptionId.ContestEntry, this.translate('commands.removeContestVote.options.contestEntry'), this.dataModel),
      new ContestVoteOption(true, OptionId.ContestVote, this.translate('commands.removeContestVote.options.contestVote'), this.dataModel),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestEntryValidator(OptionId.ContestEntry, this.dataModel),
      new ContestVoteValidator(OptionId.ContestVote, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemoveContestVoteHandler(...props);
  }
}

module.exports = RemoveContestVoteCommand;
