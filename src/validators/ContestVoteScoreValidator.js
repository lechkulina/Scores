const Validator = require('./Validator');

class ContestVoteScoreValidator extends Validator {
  constructor(optionId, categoryOptionId, dataModel, options) {
    super();
    this.optionId = optionId;
    this.categoryOptionId = categoryOptionId;
    this.dataModel = dataModel;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const category = optionsValues.get(this.categoryOptionId);
    if (!category) {
      return issues;
    }
    const score = optionsValues.get(this.optionId);
    const option = this.options.get(this.optionId);
    if (score < 0 || score > category.max) {
      issues.push(translate('validators.invalidContestVoteScoreRange', {
        description: option.description,
        categoryName: category.name,
        max: category.max,
      }));
    }
    return issues;
  }
}

module.exports = ContestVoteScoreValidator;
