const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');
const {OptionId} = require('./Options');

class ReasonOption extends Option {
  constructor(description, required) {
    super(OptionId.Reason, description, ApplicationCommandOptionTypes.NUMBER, required, true);
  }

  async getAutoCompeteResults(interaction, dataModel, value) {
    const reasons = await dataModel.getReasons();
    const response = reasons.map(({name, id}) => ({
      name,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ReasonOption;
