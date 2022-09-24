const {ContestState, calculateContestState} = require('../DataModel');
const Validator = require('./Validator');

class ContestStateValidator extends Validator {
  constructor(contestState, optionId) {
    super();
    this.contestState = contestState;
    this.optionId = optionId;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const contest = optionsValues.get(this.optionId);
    if (!contest) {
      return issues;
    }
    const contestState = calculateContestState(contest);
    if (contestState !== this.contestState) {
      const description = (() => {
        switch(this.contestState) {
          case ContestState.OpenForVoting:
            return translate('validators.openForVotingDescription');
          case ContestState.OpenForSubmittingEntries:
            return translate('validators.openForSubmittingEntriesDescription');
          case ContestState.Active:
            return translate('validators.activeDescription');
          case ContestState.NotFinished:
            return translate('validators.notFinishedDescription');
          default:
            return '';
        }
      })();
      issues.push(translate('validators.invalidContestState', {
        contestName: contest.name,
        description,
      }));
    }
    return issues;
  }
}

module.exports = ContestStateValidator;
