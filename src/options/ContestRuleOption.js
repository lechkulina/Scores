const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatEllipsis} = require('../Formatters');
const {contestRuleDescriptionLimit} = require('../constants');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class ContestRuleOption extends Option {
  constructor(description, required) {
    super(OptionId.ContestRule, description, ApplicationCommandOptionTypes.INTEGER, required, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const rules = await dataModel.getContestRulesDescriptions(interaction.guildID);
    const response = rules.map(({id, description}) => ({
      name: formatEllipsis(description, contestRuleDescriptionLimit),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ContestRuleOption;
