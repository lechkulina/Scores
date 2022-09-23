const {OptionId} = require('../options/CommonOptions');
const ContestVoteCategoryOption = require('../options/ContestVoteCategoryOption');
const ContestOption = require('../options/ContestOption');
const {ContestValidator, ContestVoteCategoryValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class AssignContestVoteCategoryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const [contest, category] = this.getOptionValues([OptionId.Contest, OptionId.ContestVoteCategory]);
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
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('common.contest'), this.dataModel),
      new ContestVoteCategoryOption(OptionId.ContestVoteCategory, this.translate('commands.assignContestVoteCategory.options.contestVoteCategory'), this.dataModel),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestVoteCategoryValidator(OptionId.ContestVoteCategory, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AssignContestVoteCategoryHandler(...props);
  }
}

module.exports = AssignContestVoteCategoryCommand;
