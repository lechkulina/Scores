const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {Option, SuggestionMethod} = require('./Option');

class ContestOption extends Option {
  constructor(contestState, id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.contestState = contestState;
  }

  async getAutoCompeteResults(interaction, dataModel, optionValue, translate) {
    const contests = await dataModel.getContestsNames(interaction.guildID, this.contestState, autoCompeteResultsLimit);
    const results = contests
      .map(({id, name}) => ({
        name: formatAutoCompleteName(id, name),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = ContestOption;
