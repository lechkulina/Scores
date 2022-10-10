const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatAutoCompleteName} = require('../Formatters');
const {autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class PollQuestionOption extends Option {
  constructor(id, pollOptionId, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.pollOptionId = pollOptionId;
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const pollId = this.findOptionValue(interaction, this.pollOptionId);
    if (!pollId) {
      return [];
    }
    const questions = await this.dataModel.getPollQuestions(pollId, autoCompeteResultsLimit);
    const results = questions
      .map(({id, description}) => ({
        name: formatAutoCompleteName(id, description),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = PollQuestionOption;
