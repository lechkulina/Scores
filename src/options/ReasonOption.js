const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {Option, SuggestionMethod} = require('./Option');

class ReasonOption extends Option {
  constructor(id, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const reasons = await this.dataModel.getReasons(autoCompeteResultsLimit);
    const results = reasons
      .map(({id, name}) => ({
        name: formatAutoCompleteName(id, name),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = ReasonOption;
