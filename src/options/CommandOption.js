const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class CommandOption extends Option {
  constructor(id, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.STRING, SuggestionMethod.Autocomplete);
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const commands = await this.dataModel.getCommands(autoCompeteResultsLimit);
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
