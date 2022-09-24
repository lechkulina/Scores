const Validator = require('./Validator');

class ContestVoteCategoryValidator extends Validator {
  constructor(voteCategoryOptionId, dataModel) {
    super();
    this.voteCategoryOptionId = voteCategoryOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const voteCategoryId = optionsValues.get(this.voteCategoryOptionId);
    try {
      const category = await this.dataModel.getContestVoteCategory(voteCategoryId);
      if (category) {
        optionsValues.set(this.voteCategoryOptionId, category);
      } else {
        issues.push(translate('validators.unknownContestVoteCategory', {
          voteCategoryId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest vote category ${contestVoteCategoryId} data - got error`, error);
      issues.push(translate('validators.contestVoteCategoryFetchFailure', {
        voteCategoryId,
      }));
    }
    return issues;
  }
}

module.exports = ContestVoteCategoryValidator;
