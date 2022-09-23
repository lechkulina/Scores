const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestVoteCategoriesOption extends Option {
  constructor(id, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const categories = await this.dataModel.getAssignedContestVoteCategories(contestId, autoCompeteResultsLimit);
    const results = categories
      .map(({id, name}) => ({
        name: formatAutoCompleteName(id, name),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = AssignedContestVoteCategoriesOption;
