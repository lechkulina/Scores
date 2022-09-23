const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatAutoCompleteName} = require('../Formatters');
const {autoCompeteResultsLimit} = require('../constants');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestRuleOption extends Option {
  constructor(id, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const rules = await this.dataModel.getAssignedContestRules(contestId, autoCompeteResultsLimit);
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
