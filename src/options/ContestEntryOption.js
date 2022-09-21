const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class ContestEntryOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const authorId = interaction.member.user.id;
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId || !authorId) {
      return [];
    }
    const entries = await dataModel.getContestEntriesNames(contestId, authorId, autoCompeteResultsLimit);
    const response = entries.map(({id, name}) => ({
      name: formatAutoCompleteName(id, name),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = ContestEntryOption;
