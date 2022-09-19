const {OptionId} = require('../options/CommonOptions');
const ContestVoteCategoryOption = require('../options/ContestVoteCategoryOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class AssignContestVoteCategoryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    const category = await this.dataModel.getContestVoteCategory(this.getOptionValue(OptionId.ContestVoteCategory));
    try {
      await this.dataModel.assignContestVoteCategory(contest.id, category.id);
      return interaction.createMessage(
          this.translate('commands.assignContestVoteCategory.messages.success', {
          contestName: contest.name,
          categoryName: category.name,
        })
      );
    } catch (error) {
      return interaction.createMessage(
        this.translate('commands.assignContestVoteCategory.errors.failure', {
          contestName: contest.name,
          categoryName: category.name,
        })
      );
    }
  }
}

class AssignContestVoteCategoryCommand extends Command {
  constructor(...props) {
    super('assign-contest-vote-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.assignContestVoteCategory.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, this.translate('common.contest')),
      new ContestVoteCategoryOption(this.translate('commands.assignContestVoteCategory.options.contestVoteCategory')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AssignContestVoteCategoryHandler(...props);
  }
}

module.exports = AssignContestVoteCategoryCommand;
