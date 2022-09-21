const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class ReasonOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const reasons = await dataModel.getReasons(autoCompeteResultsLimit);
    const response = reasons.map(({name, id}) => ({
      name,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ReasonOption;
