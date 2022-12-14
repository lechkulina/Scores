const {OptionId} = require('../options/CommonOptions');
const AssignedContestRewardOption = require('../options/AssignedContestRewardOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestValidator, ContestRewardValidator} = require('../validators/validators');
const {ContestState} = require('../DataModel');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class UnassignContestRuleHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.contest = this.getOptionValue(OptionId.Contest);
    this.reward =  this.getOptionValue(OptionId.AssignedContestReward);
    this.rewardDescription = formatEllipsis(this.reward.description, autoCompeteNameLimit);
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
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('common.contest'), this.dataModel),
      new AssignedContestRewardOption(OptionId.AssignedContestReward, OptionId.Contest, this.translate('commands.unassignContestReward.options.contestReward'), this.dataModel),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestRewardValidator(OptionId.AssignedContestReward, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new UnassignContestRuleHandler(...props);
  }
}

module.exports = UnassignContestRewardCommand;
