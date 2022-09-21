const Validator = require('./Validator');

class ContestRewardValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const contestRewardId = optionsValues.get(this.optionId);
    try {
      const reward = await this.dataModel.getContestReward(contestRewardId);
      if (reward) {
        optionsValues.set(this.optionId, reward);
      } else {
        issues.push(translate('validators.unknownContestReward', {
          contestRewardId,
        }));
      }
    } catch(error) {
      issues.push(translate('validators.contestRewardFetchFailure', {
        contestRewardId,
      }));
    }
    return issues;
  }
}

module.exports = ContestRewardValidator;
