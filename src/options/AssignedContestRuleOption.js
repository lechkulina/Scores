const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatEllipsis} = require('../Formatters');
const {contestRuleDescriptionLimit} = require('../constants');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestRuleOption extends Option {
  constructor(description, required) {
    super(OptionId.AssignedContestRule, description, ApplicationCommandOptionTypes.INTEGER, required, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const rules = await dataModel.getAssignedContestRules(contestId);
    const response = rules.map(({id, description}) => ({
      name: formatEllipsis(description, contestRuleDescriptionLimit),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = AssignedContestRuleOption;
