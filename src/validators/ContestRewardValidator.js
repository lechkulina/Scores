const Validator = require('./Validator');

class ContestRewardValidator extends Validator {
  constructor(rewardOptionId, dataModel) {
    super();
    this.rewardOptionId = rewardOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const rewardId = optionsValues.get(this.rewardOptionId);
    try {
      const reward = await this.dataModel.getContestReward(rewardId);
      if (reward) {
        optionsValues.set(this.rewardOptionId, reward);
      } else {
        issues.push(translate('validators.unknownContestReward', {
          rewardId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest reward ${rewardId} data - got error`, error);
      issues.push(translate('validators.contestRewardFetchFailure', {
        rewardId,
      }));
    }
    return issues;
  }
}

module.exports = ContestRewardValidator;
