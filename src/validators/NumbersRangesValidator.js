const Validator = require('./Validator');

class NumbersRangesValidator extends Validator {
  constructor(optionsIds, options) {
    super();
    this.optionsIds = optionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.optionsIds.forEach(([minOptionId, maxOptionId]) => {
      const minOption = this.options.get(minOptionId);
      const minOptionValue = optionsValues.get(minOptionId);
      const maxOption = this.options.get(maxOptionId);
      const maxOptionValue = optionsValues.get(maxOptionId);
      if (minOptionValue >= maxOptionValue) {
        issues.push(translate('validators.invalidNumbersRange', {
          min: minOption.description,
          max: maxOption.description,
        }));
      }
    });
    return issues;
  }
}

module.exports = NumbersRangesValidator;
