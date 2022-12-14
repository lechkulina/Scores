const Validator = require('./Validator');

class ContestVoteCategoryValidator extends Validator {
  constructor(categoryOptionId, dataModel) {
    super();
    this.categoryOptionId = categoryOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const categoryId = optionsValues.get(this.categoryOptionId);
    try {
      const category = await this.dataModel.getContestVoteCategory(categoryId);
      if (category) {
        optionsValues.set(this.categoryOptionId, category);
      } else {
        issues.push(translate('validators.unknownContestVoteCategory', {
          categoryId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest vote category ${categoryId} data - got error`, error);
      issues.push(translate('validators.contestVoteCategoryFetchFailure', {
        categoryId,
      }));
    }
    return issues;
  }
}

module.exports = ContestVoteCategoryValidator;
