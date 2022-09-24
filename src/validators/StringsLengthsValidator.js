const Validator = require('./Validator');

class StringsLengthsValidator extends Validator {
  constructor(minLength, maxLength, optionsIds, options) {
    super();
    this.minLength = minLength;
    this.maxLength = maxLength;
    this.optionsIds = optionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.optionsIds.forEach(optionId => {
      const optionValue = optionsValues.get(optionId);
      const option = this.options.get(optionId);
      if (!optionValue || optionValue.length < this.minLength || optionValue.length > this.maxLength) {
        issues.push(translate('validators.invalidLength', {
          description: option.description,
          min: this.minLength,
          max: this.maxLength,
        }));
      }
    });
    return issues;
  }
}

module.exports = StringsLengthsValidator;
