const {ContestState, calculateContestState} = require('../DataModel');
const Validator = require('./Validator');

class ContestStateValidator extends Validator {
  constructor(contestState, contestOptionId) {
    super();
    this.contestState = contestState;
    this.contestOptionId = contestOptionId;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const contest = optionsValues.get(this.contestOptionId);
    if (!contest || this.contestState === ContestState.Any) {
      return issues;
    }
    const contestState = calculateContestState(contest);
    if (contestState !== this.contestState) {
      issues.push(translate('validators.invalidContestState', {
        contestName: contest.name,
        contestState: translate(`common.contestState.${contestState}`).toLowerCase(),
      }));
    }
    return issues;
  }
}

module.exports = ContestStateValidator;
