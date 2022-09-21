const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class CommandOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.STRING, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const commands = await dataModel.getCommands();
    const response = commands.map(({id}) => ({
      name: id,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = CommandOption;
