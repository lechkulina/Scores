const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {OptionId} = require('./CommonOptions');
const Option = require('./Option');

class ContestOption extends Option {
  constructor(description, required) {
    super(OptionId.Contest, description, ApplicationCommandOptionTypes.INTEGER, required, true);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const contests = await dataModel.getContestsNames(interaction.guildID);
    const response = contests.map(({id, name}) => ({
      name,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ContestOption;
