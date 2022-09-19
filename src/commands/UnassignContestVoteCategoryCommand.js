const {OptionId} = require('../options/CommonOptions');
const AssignedContestVoteCategoriesOption = require('../options/AssignedContestVoteCategoriesOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class UnassignContestVoteCategoryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    this.category = await this.dataModel.getContestVoteCategory(this.getOptionValue(OptionId.AssignedContestVoteCategory));
    return interaction.createMessage({
      content: this.translate('commands.unassignContestVoteCategory.messages.confirmation', {
        contestName: this.contest.name,
        categoryName: this.category.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.unassignContestVoteCategory(this.contest.id, this.category.id);
        return this.translate('commands.unassignContestVoteCategory.messages.success', {
          contestName: this.contest.name,
          categoryName: this.category.name,
        });
      } catch (error) {
        return this.translate('commands.unassignContestVoteCategory.errors.failure', {
          contestName: this.contest.name,
          categoryName: this.category.name,
        });
      }
    });
  }
}

class UnassignContestVoteCategoryCommand extends Command {
  constructor(...props) {
    super('unassign-contest-vote-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.unassignContestVoteCategory.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, this.translate('common.contest')),
      new AssignedContestVoteCategoriesOption(this.translate('commands.unassignContestVoteCategory.options.contestVoteCategory')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new UnassignContestVoteCategoryHandler(...props);
  }
}

module.exports = UnassignContestVoteCategoryCommand;
