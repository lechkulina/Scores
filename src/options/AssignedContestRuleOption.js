const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatAutoCompleteName} = require('../Formatters');
const {autoCompeteResultsLimit} = require('../constants');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestRuleOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, optionValue, translate) {
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const rules = await dataModel.getAssignedContestRules(contestId, autoCompeteResultsLimit);
    const results = rules
      .map(({id, description}) => ({
        name: formatAutoCompleteName(id, description),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = AssignedContestRuleOption;
