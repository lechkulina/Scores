const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');

class ReasonOption extends Option {
  constructor(name, description, required) {
    super(name, description, ApplicationCommandOptionTypes.NUMBER, required, true);
  }

  async getAutoCompeteResults(autocompleteInteraction, dataModel, value) {
    const reasons = await dataModel.getReasons();
    const response = reasons.map(({name, id}) => ({
      name,
      value: id,
    }));
    return autocompleteInteraction.result(response);
  }
}

module.exports = ReasonOption;
