const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class ContestVoteCategoryOption extends Option {
  constructor(description, required) {
    super(OptionId.ContestVoteCategory, description, ApplicationCommandOptionTypes.INTEGER, required, SuggestionMethod.Autocomplete);
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
