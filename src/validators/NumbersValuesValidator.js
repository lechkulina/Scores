const Validator = require('./Validator');

class NumbersValuesValidator extends Validator {
  constructor(optionsIds, options) {
    super();
    this.optionsIds = optionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues) {
    const issues = [];
    this.optionsIds.forEach(optionId => {
      const option = this.options.get(optionId);
      const optionValue = optionsValues.get(optionId);
      if (optionValue < 0) {
        optionsValues.delete(optionId);
        issues.push(translate('validators.invalidNumberZero', {
          description: option.description,
        }));      
      }
    });
    return issues;
  }
}

module.exports = NumbersValuesValidator;