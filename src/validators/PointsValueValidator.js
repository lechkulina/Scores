const Validator = require('./Validator');

class PointsValueValidator extends Validator {
  constructor(optionId, reasonOptionId, dataModel, options) {
    super();
    this.optionId = optionId;
    this.reasonOptionId = reasonOptionId;
    this.dataModel = dataModel;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const reason = optionsValues.get(this.reasonOptionId);
    if (!reason) {
      return issues;
    }
    const points = optionsValues.get(this.optionId);
    const option = this.options.get(this.optionId);
    if (points < reason.min || points > reason.max) {
      issues.push(translate('validators.invalidPointsRange', {
        description: option.description,
        reasonName: reason.name,
        min: reason.min,
        max: reason.max,
      }));
    }
    return issues;
  }
}

module.exports = PointsValueValidator;
