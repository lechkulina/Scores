const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatEllipsis} = require('../Formatters');
const {contestRuleDescriptionLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class ContestRuleOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
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
