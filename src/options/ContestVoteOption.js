const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class ContestVoteOption extends Option {
  constructor(owned, id, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.owned = owned;
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const voterId = this.owned ? interaction.member.user.id : undefined;
    const contestEntryId = interaction.data.options.find(({name}) => name === OptionId.ContestEntry)?.value;
    if (!contestEntryId) {
      return [];
    }
    const votes = await this.dataModel.getContestVotesNames(contestEntryId, voterId, autoCompeteResultsLimit);
    const results = votes
      .map(({id, score, categoryName}) => {
        const name = translate('autoCompete.contestVote', {
          score,
          categoryName,
        });
        return {
          name: formatAutoCompleteName(id, name),
          value: id,
        };
      });
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = ContestVoteOption;



