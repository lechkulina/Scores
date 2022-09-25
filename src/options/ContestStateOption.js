const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {ContestState} = require('../DataModel');
const {Option, SuggestionMethod} = require('./Option');

const choosableContestStates = [
  ContestState.OpenForSubmittingEntries,
  ContestState.OpenForVoting,
  ContestState.Finished,
];

class ContestStateOption extends Option {
  constructor(id, description, translate) {
    super(id, description, ApplicationCommandOptionTypes.STRING, SuggestionMethod.Choices);
    this.translate = translate;
  }

  getChoices() {
    return choosableContestStates.map((contestState) => {
      return {
        name: this.translate(`common.contestState.${contestState}`),
        value: contestState,
      } ;
    });
  }
}

module.exports = ContestStateOption;
