const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');
const {OptionId} = require('./Options');

class CommandOption extends Option {
  constructor(description, required) {
    super(OptionId.Command, description, ApplicationCommandOptionTypes.STRING, required, true);
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
