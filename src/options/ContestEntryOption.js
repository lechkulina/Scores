const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class ContestEntryOption extends Option {
  constructor(owned, id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.owned = owned;
  }

  async getAutoCompeteResults(interaction, dataModel, optionValue, translate) {
    const authorId = this.owned ? interaction.member.user.id : undefined;
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const entries = await dataModel.getContestEntriesNames(contestId, authorId, autoCompeteResultsLimit);
    const results = entries
      .map(({id, name}) => ({
        name: formatAutoCompleteName(id, name),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = ContestEntryOption;
