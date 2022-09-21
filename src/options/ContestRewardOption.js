const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatEllipsis} = require('../Formatters');
const {contestRewardDescriptionLimit, autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class ContestRewardOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const rewards = await dataModel.getContestRewardsDescriptions(interaction.guildID, autoCompeteResultsLimit);
    const response = rewards.map(({id, description}) => ({
      name: formatEllipsis(description, contestRewardDescriptionLimit),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ContestRewardOption;
