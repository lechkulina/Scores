const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {OptionId} = require('./CommonOptions');
const Option = require('./Option');

class ContestOption extends Option {
  constructor(contestState, description, required) {
    super(OptionId.Contest, description, ApplicationCommandOptionTypes.INTEGER, required, true);
    this.contestState = contestState;
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const contests = await dataModel.getContestsNames(interaction.guildID, this.contestState);
    const response = contests.map(({id, name}) => ({
      name,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ContestOption;
