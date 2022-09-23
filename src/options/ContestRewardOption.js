const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatAutoCompleteName} = require('../Formatters');
const {autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class ContestRewardOption extends Option {
  constructor(id, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const rewards = await this.dataModel.getContestRewardsDescriptions(interaction.guildID, autoCompeteResultsLimit);
    const results = rewards
      .map(({id, description}) => ({
        name: formatAutoCompleteName(id, description),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = ContestRewardOption;
