const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {OptionId} = require('./CommonOptions');
const Option = require('./Option');

class ContestVoteCategoryOption extends Option {
  constructor(description, required) {
    super(OptionId.ContestVoteCategory, description, ApplicationCommandOptionTypes.INTEGER, required, true);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const contests = await dataModel.getContestVoteCategoriesNames(interaction.guildID);
    const response = contests.map(({id, name}) => ({
      name,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ContestVoteCategoryOption;
