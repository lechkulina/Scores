const Validator = require('./Validator');

class PointsValueValidator extends Validator {
  constructor(pointsOptionId, categoryOptionId, options) {
    super();
    this.pointsOptionId = pointsOptionId;
    this.categoryOptionId = categoryOptionId;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const category = optionsValues.get(this.categoryOptionId);
    if (!category) {
      return issues;
    }
    const points = optionsValues.get(this.pointsOptionId);
    const option = this.options.get(this.pointsOptionId);
    if (points < category.min || points > category.max) {
      issues.push(translate('validators.invalidPointsRange', {
        description: option.description,
        categoryName: category.name,
        min: category.min,
        max: category.max,
      }));
    }
    return issues;
  }
}

module.exports = PointsValueValidator;
