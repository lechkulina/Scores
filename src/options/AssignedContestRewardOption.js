const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatAutoCompleteName} = require('../Formatters');
const {autoCompeteResultsLimit} = require('../constants');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestRewardOption extends Option {
  constructor(id, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const rewards = await this.dataModel.getAssignedContestRewards(contestId, autoCompeteResultsLimit);
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

module.exports = AssignedContestRewardOption;
