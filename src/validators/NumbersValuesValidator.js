const Validator = require('./Validator');

class NumbersValuesValidator extends Validator {
  constructor(numberOptionsIds, options) {
    super();
    this.numberOptionsIds = numberOptionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.numberOptionsIds.forEach(numberOptionId => {
      const option = this.options.get(numberOptionId);
      const value = optionsValues.get(numberOptionId);
      if (value < 0) {
        issues.push(translate('validators.invalidNumberZero', {
          description: option.description,
        }));      
      }
    });
    return issues;
  }
}

module.exports = NumbersValuesValidator;
