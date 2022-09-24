const {OptionId} = require('../options/CommonOptions');
const ContestRewardOption = require('../options/ContestRewardOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestValidator, ContestRewardValidator} = require('../validators/validators');
const {ContestState} = require('../DataModel');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class AssignContestRewardHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const contest = this.getOptionValue(OptionId.Contest);
    const reward = this.getOptionValue(OptionId.ContestReward);
    const rewardDescription = formatEllipsis(reward.description, autoCompeteNameLimit);
    try {
      await this.dataModel.assignContestReward(contest.id, reward.id);
      return interaction.createMessage(
          this.translate('commands.assignContestReward.messages.success', {
          contestName: contest.name,
          rewardDescription,
        })
      );
    } catch (error) {
      return interaction.createMessage(
        this.translate('commands.assignContestReward.errors.failure', {
          contestName: contest.name,
          rewardDescription,
        })
      );
    }
  }
}

class AssignContestRewardCommand extends Command {
  constructor(...props) {
    super('assign-contest-reward', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.assignContestReward.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('common.contest'), this.dataModel),
      new ContestRewardOption(OptionId.ContestReward, this.translate('commands.assignContestReward.options.contestReward'), this.dataModel),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestRewardValidator(OptionId.ContestReward, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AssignContestRewardHandler(...props);
  }
}

module.exports = AssignContestRewardCommand;
