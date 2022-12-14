const {OptionId, StringOption, BooleanOption} = require('../options/CommonOptions');
const {StringsLengthsValidator, ContestRewardValidator} = require('../validators/validators');
const ContestRewardOption = require('../options/ContestRewardOption');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {SettingId} = require('../Settings');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class ChangeContestRewardHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.reward = this.getOptionValue(OptionId.ContestReward);
    this.rewardDescription = formatEllipsis(this.reward.description, autoCompeteNameLimit);
    return interaction.createMessage({
      content: this.translate('commands.changeContestReward.messages.confirmation', {
        rewardDescription: this.rewardDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const description = this.getOptionValue(OptionId.Description);
    const useByDefault = this.getOptionValue(OptionId.UseByDefault);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContestReward(this.reward.id, description, useByDefault);
        return this.translate('commands.changeContestReward.messages.success', {
          rewardDescription: this.rewardDescription,
        });
      } catch (error) {
        return this.translate('commands.changeContestReward.errors.failure', {
          rewardDescription: this.rewardDescription,
        });
      }
    });
  }
}

class ChangeContestRewardCommand extends Command {
  constructor(...props) {
    super('change-contest-reward', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changeContestReward.description'));
    this.addOptions([
      new ContestRewardOption(OptionId.ContestReward, this.translate('commands.changeContestReward.options.contestReward'), this.dataModel),
      new StringOption(OptionId.Description, this.translate('commands.changeContestReward.options.description')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.changeContestReward.options.useByDefault')),
    ]);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    this.addValidators([
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new ContestRewardValidator(OptionId.ContestReward, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeContestRewardHandler(...props);
  }
}

module.exports = ChangeContestRewardCommand;
