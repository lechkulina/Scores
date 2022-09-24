const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class ContestEntryOption extends Option {
  constructor(owned, id, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.owned = owned;
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const authorId = this.owned ? interaction.member.user.id : undefined;
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    console.info('QQQQ contestId', contestId);
    if (!contestId) {
      return [];
    }
    console.info('QQQQ AAA');
    const entries = await this.dataModel.getContestEntriesNames(contestId, authorId, autoCompeteResultsLimit);
    console.info('QQQQ entries', entries);
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
