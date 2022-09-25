const {OptionId} = require('../options/CommonOptions');
const ContestRewardOption = require('../options/ContestRewardOption');
const {ContestRewardValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class RemoveContestRewardHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
      this.reward = this.getOptionValue(OptionId.ContestReward);
      this.rewardDescription = formatEllipsis(this.reward.description, autoCompeteNameLimit);
      return interaction.createMessage({
        content: this.translate('commands.removeContestReward.messages.confirmation', {
          rewardDescription: this.rewardDescription,
        }),
        components: this.createConfirmationForm(),
      });
    }
  
    async handleComponentInteraction(interaction) {
      return this.handleConfirmationForm(interaction, async () => {
        try {
          await this.dataModel.removeContestReward(this.reward.id);
          return this.translate('commands.removeContestReward.messages.success', {
            rewardDescription: this.rewardDescription,
          });
        } catch (error) {
          return this.translate('commands.removeContestReward.errors.failure', {
            rewardDescription: this.rewardDescription,
          });
        }
      });
    }
}

class RemoveContestRewardCommand extends Command {
  constructor(...props) {
    super('remove-contest-reward', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removeContestReward.description'));
    this.addOptions([
      new ContestRewardOption(OptionId.ContestReward, this.translate('commands.removeContestReward.options.contestReward'), this.dataModel),
    ]);
    this.addValidators([
      new ContestRewardValidator(OptionId.ContestReward, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemoveContestRewardHandler(...props);
  }
}

module.exports = RemoveContestRewardCommand;
