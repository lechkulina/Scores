const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatAutoCompleteName} = require('../Formatters');
const {autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class PollAnswerOption extends Option {
  constructor(id, pollQuestionOptionId, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.pollQuestionOptionId = pollQuestionOptionId;
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const pollQuestionId = this.findOptionValue(interaction, this.pollQuestionOptionId);
    if (!pollQuestionId) {
      return [];
    }
    const answers = await this.dataModel.getPollAnswers(pollQuestionId, autoCompeteResultsLimit);
    const results = answers
      .map(({id, description}) => ({
        name: formatAutoCompleteName(id, description),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = PollAnswerOption;
