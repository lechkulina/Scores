const {OptionId} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RemoveContestInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.contest = await this.dataModel.getContest(interaction.guildID, this.getOptionValue(OptionId.Contest));
    return interaction.createMessage({
      content: this.translate('commands.removeContest.messages.confirmation', {
        contestName: this.contest.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removeContest(interaction.guildID, this.contest.id);
        return this.translate('commands.removeContest.messages.success', {
          contestName: this.contest.name,
        });
      } catch (error) {
        return this.translate('commands.removeContest.errors.failure', {
          contestName: this.contest.name,
        });
      }
    });
  }
}

class RemoveContestCommand extends Command {
  constructor(...props) {
    super('remove-contest', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removeContest.description'));
    this.addOptions([
      new ContestOption(this.translate('common.contest')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemoveContestInteractionHandler(...props);
  }
}

module.exports = RemoveContestCommand;
