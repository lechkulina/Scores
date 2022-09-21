const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class ContestOption extends Option {
  constructor(contestState, id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.contestState = contestState;
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const contests = await dataModel.getContestsNames(interaction.guildID, this.contestState, autoCompeteResultsLimit);
    const response = contests.map(({id, name}) => ({
      name,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ContestOption;
