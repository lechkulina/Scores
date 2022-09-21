const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class CommandOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.STRING, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, optionValue, translate) {
    const commands = await dataModel.getCommands(autoCompeteResultsLimit);
    const results = commands
      .map(({id}) => ({
        name: id,
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = CommandOption;
