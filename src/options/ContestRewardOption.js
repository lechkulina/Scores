const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatEllipsis} = require('../Formatters');
const {contestRewardDescriptionLimit} = require('../constants');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class ContestRewardOption extends Option {
  constructor(description, required) {
    super(OptionId.ContestReward, description, ApplicationCommandOptionTypes.INTEGER, required, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const rewards = await dataModel.getContestRewardsDescriptions(interaction.guildID);
    const response = rewards.map(({id, description}) => ({
      name: formatEllipsis(description, contestRewardDescriptionLimit),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ContestRewardOption;
