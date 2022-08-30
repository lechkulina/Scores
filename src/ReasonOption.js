const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');

class ReasonOption extends Option {
  constructor(name, description, required) {
    super(name, description, ApplicationCommandOptionTypes.NUMBER, required, true);
  }

  async getAutoCompeteResults(interaction, dataModel, value) {
    const reasonsArray = await dataModel.getReasonsArray();
    const response = reasonsArray.map(({name, id}) => ({
      name,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ReasonOption;
