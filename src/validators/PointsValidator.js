const Validator = require('./Validator');

class PointsValidator extends Validator {
  constructor(optionId, reasonOptionId, dataModel, options) {
    super();
    this.optionId = optionId;
    this.reasonOptionId = reasonOptionId;
    this.dataModel = dataModel;
    this.options = options;
  }

  async validate(translate, optionsValues) {
    const issues = [];
    const reason = await this.dataModel.getReason(optionsValues.get(this.reasonOptionId));
    if (!reason) {
      return issues;
    }
    const optionValue = optionsValues.get(this.optionId);
    const option = this.options.get(this.optionId);
    if (optionValue < reason.min || optionValue > reason.max) {
      optionsValues.delete(this.optionId);
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

module.exports = PointsValidator;
