const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {Option, SuggestionMethod} = require('./Option');

class ContestEntryOption extends Option {
  constructor(owned, id, contestOptionId, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.owned = owned;
    this.contestOptionId = contestOptionId;
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const authorId = this.owned ? interaction.member.user.id : undefined;
    const contestId = interaction.data.options.find(({name}) => name === this.contestOptionId)?.value;
    if (!contestId) {
      return [];
    }
    const entries = await this.dataModel.getContestEntriesNames({
      contestId,
      authorId,
      limit: autoCompeteResultsLimit,
    });
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
