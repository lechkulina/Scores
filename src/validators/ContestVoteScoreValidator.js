const Validator = require('./Validator');

class ContestVoteScoreValidator extends Validator {
  constructor(voteScoreOptionId, voteCategoryOptionId, options) {
    super();
    this.voteScoreOptionId = voteScoreOptionId;
    this.voteCategoryOptionId = voteCategoryOptionId;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const category = optionsValues.get(this.voteCategoryOptionId);
    if (!category) {
      return issues;
    }
    const option = this.options.get(this.voteScoreOptionId);
    const score = optionsValues.get(this.voteScoreOptionId);
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
