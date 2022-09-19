const {OptionId, StringOption, BooleanOption} = require('../options/CommonOptions');
const {StringsLengthsValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {contestRewardDescriptionLimit} = require('../constants');
const Command = require('./Command');

class AddContestRewardHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const [description, useByDefault] = this.getOptionValues([      
      OptionId.Description,
      OptionId.UseByDefault,
    ]);
    const rewardDescription = formatEllipsis(description, contestRewardDescriptionLimit);
    try {
      await this.dataModel.addContestReward(description, useByDefault, interaction.guildID);
      return interaction.createMessage({
        content: this.translate('commands.addContestReward.messages.success', {
          rewardDescription,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addContestReward.errors.failure', {
        rewardDescription,
      }));
    }
  }
}

class AddContestRewardCommand extends Command {
  constructor(...props) {
    super('add-contest-reward', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addContestReward.description'));
    this.addOptions([
      new StringOption(OptionId.Description, this.translate('commands.addContestReward.options.description')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.addContestReward.options.useByDefault')),
    ]);
    this.addValidators([
      new StringsLengthsValidator([OptionId.Description], 'minDescriptionLength', 'maxDescriptionLength', this.settings, this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestRewardHandler(...props);
  }
}

module.exports = AddContestRewardCommand;
