const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatAutoCompleteName} = require('../Formatters');
const {autoCompeteResultsLimit} = require('../constants');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestRuleOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const rules = await dataModel.getAssignedContestRules(contestId, autoCompeteResultsLimit);
    const response = rules.map(({id, description}) => ({
      name: formatAutoCompleteName(id, description),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = AssignedContestRuleOption;
