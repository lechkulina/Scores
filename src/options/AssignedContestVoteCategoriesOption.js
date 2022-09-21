const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestVoteCategoriesOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const categories = await dataModel.getAssignedContestVoteCategories(contestId, autoCompeteResultsLimit);
    const response = categories.map(({id, name}) => ({
      name: formatAutoCompleteName(id, name),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = AssignedContestVoteCategoriesOption;
