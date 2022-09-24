const Validator = require('./Validator');

class StringsLengthsValidator extends Validator {
  constructor(minLength, maxLength, stringOptionsIds, options) {
    super();
    this.minLength = minLength;
    this.maxLength = maxLength;
    this.stringOptionsIds = stringOptionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.stringOptionsIds.forEach(stringOptionId => {
      const option = this.options.get(stringOptionId);
      const value = optionsValues.get(stringOptionId);
      if (!value || value.length < this.minLength || value.length > this.maxLength) {
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
