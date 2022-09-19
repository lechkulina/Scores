const {OptionId} = require('../options/CommonOptions');
const AssignedContestRewardOption = require('../options/AssignedContestRewardOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const {formatEllipsis} = require('../Formatters');
const {contestRewardDescriptionLimit} = require('../constants');
const Command = require('./Command');

class UnassignContestRuleHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    this.reward = await this.dataModel.getContestReward(this.getOptionValue(OptionId.AssignedContestReward));
    this.rewardDescription = formatEllipsis(this.reward.description, contestRewardDescriptionLimit);
    return interaction.createMessage({
      content: this.translate('commands.unassignContestReward.messages.confirmation', {
        contestName: this.contest.name,
        rewardDescription: this.rewardDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.unassignContestReward(this.contest.id, this.reward.id);
        return this.translate('commands.unassignContestReward.messages.success', {
          contestName: this.contest.name,
          rewardDescription: this.rewardDescription,
        });
      } catch (error) {
        return this.translate('commands.unassignContestReward.errors.failure', {
          contestName: this.contest.name,
          rewardDescription: this.rewardDescription,
        });
      }
    });
  }
}

class UnassignContestRewardCommand extends Command {
  constructor(...props) {
    super('unassign-contest-reward', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.unassignContestReward.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, this.translate('common.contest')),
      new AssignedContestRewardOption(this.translate('commands.unassignContestReward.options.contestReward')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new UnassignContestRuleHandler(...props);
  }
}

module.exports = UnassignContestRewardCommand;
