const Validator = require('./Validator');

class ContestValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const contestId = optionsValues.get(this.optionId);
    try {
      const contest = await this.dataModel.getContest(contestId);
      if (contest) {
        optionsValues.set(this.optionId, contest);
      } else {
        issues.push(translate('validators.unknownContest', {
          contestId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest ${contestId} data - got error`, error);
      issues.push(translate('validators.contestFetchFailure', {
        contestId,
      }));
    }
    return issues;
  }
}

module.exports = ContestValidator;
