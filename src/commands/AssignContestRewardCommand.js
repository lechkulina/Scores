const {OptionId} = require('../options/CommonOptions');
const ContestRewardOption = require('../options/ContestRewardOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const {formatEllipsis} = require('../Formatters');
const {contestRewardDescriptionLimit} = require('../constants');
const Command = require('./Command');

class AssignContestRewardHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    const reward = await this.dataModel.getContestReward(this.getOptionValue(OptionId.ContestReward));
    const rewardDescription = formatEllipsis(reward.description, contestRewardDescriptionLimit);
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
      new ContestOption(ContestState.Any, this.translate('common.contest')),
      new ContestRewardOption(this.translate('commands.assignContestReward.options.contestReward')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AssignContestRewardHandler(...props);
  }
}

module.exports = AssignContestRewardCommand;
