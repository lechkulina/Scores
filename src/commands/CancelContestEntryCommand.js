const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const ContestEntryOption = require('../options/ContestEntryOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class CancelContestEntryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    this.entry = await this.dataModel.getContestEntry(this.getOptionValue(OptionId.ContestEntry));
    return interaction.createMessage({
      content: this.translate('commands.cancelContestEntry.messages.confirmation', {
        entryName: this.entry.name,
        contestName: this.contest.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const authorId = interaction.member.user.id;
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.cancelContestEntry(this.entry.id, this.contest.id, authorId);
        return this.translate('commands.cancelContestEntry.messages.success', {
          entryName: this.entry.name,
          contestName: this.contest.name,
        });
      } catch (error) {
        return this.translate('commands.cancelContestEntry.errors.failure', {
          entryName: this.entry.name,
          contestName: this.contest.name,
        });
      }
    });
  }
}

class CancelContestEntryCommand extends Command {
  constructor(...props) {
    super('cancel-contest-entry', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.cancelContestEntry.description'));
    this.addOptions([
      new ContestOption(ContestState.ReadyToSubmitEntries, this.translate('commands.cancelContestEntry.options.contest')),
      new ContestEntryOption(this.translate('commands.cancelContestEntry.options.contestEntry')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new CancelContestEntryHandler(...props);
  }
}

module.exports = CancelContestEntryCommand;
