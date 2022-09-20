const {OptionId, StringOption, BooleanOption} = require('../options/CommonOptions');
const {StringsLengthsValidator} = require('../validators/validators');
const ContestRewardOption = require('../options/ContestRewardOption');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {contestRewardDescriptionLimit} = require('../constants');
const Command = require('./Command');

class ChangeContestRewardHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.reward = await this.dataModel.getContestReward(this.getOptionValue(OptionId.ContestReward));
    this.rewardDescription = formatEllipsis(this.reward.description, contestRewardDescriptionLimit);
    return interaction.createMessage({
      content: this.translate('commands.changeContestReward.messages.confirmation', {
        rewardDescription: this.rewardDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const [description, useByDefault] = this.getOptionValues([      
      OptionId.Description,
      OptionId.UseByDefault,
    ]);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContestReward(this.reward.id, description, useByDefault, interaction.guildID);
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
      new ContestRewardOption(this.translate('commands.changeContestReward.options.contestReward')),
      new StringOption(OptionId.Description, this.translate('commands.changeContestReward.options.description')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.changeContestReward.options.useByDefault')),
    ]);
    this.addValidators([
      new StringsLengthsValidator([OptionId.Description], 'minDescriptionLength', 'maxDescriptionLength', this.settings, this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeContestRewardHandler(...props);
  }
}

module.exports = ChangeContestRewardCommand;
