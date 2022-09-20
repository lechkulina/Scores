const {OptionId} = require('../options/CommonOptions');
const ContestVoteCategoryOption = require('../options/ContestVoteCategoryOption');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class AddContestVoteCategoryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.category = await this.dataModel.getContestVoteCategory(this.getOptionValue(OptionId.ContestVoteCategory));
    return interaction.createMessage({
      content: this.translate('commands.removeContestVoteCategory.messages.confirmation', {
        categoryName: this.category.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removeContestVoteCategory(this.category.id, interaction.guildID);
        return this.translate('commands.removeContestVoteCategory.messages.success', {
          categoryName: this.category.name,
        });
      } catch (error) {
        return this.translate('commands.removeContestVoteCategory.errors.failure', {
          categoryName: this.category.name,
        });
      }
    });
  }
}

class RemoveContestVoteCategoryCommand extends Command {
  constructor(...props) {
    super('remove-contest-vote-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removeContestVoteCategory.description'));
    this.addOptions([
      new ContestVoteCategoryOption(this.translate('commands.removeContestVoteCategory.options.contestVoteCategory')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestVoteCategoryHandler(...props);
  }
}

module.exports = RemoveContestVoteCategoryCommand;
