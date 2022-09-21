const Validator = require('./Validator');

class ContestVoteCategoryValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const contestVoteCategoryId = optionsValues.get(this.optionId);
    try {
      const category = await this.dataModel.getContestVoteCategory(contestVoteCategoryId);
      if (category) {
        optionsValues.set(this.optionId, category);
      } else {
        issues.push(translate('validators.unknownContestVoteCategory', {
          contestVoteCategoryId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest vote category ${contestVoteCategoryId} data - got error`, error);
      issues.push(translate('validators.contestVoteCategoryFetchFailure', {
        contestVoteCategoryId,
      }));
    }
    return issues;
  }
}

module.exports = ContestVoteCategoryValidator;
