const Validator = require('./Validator');

class FirstLetterValidator extends Validator {
  constructor(optionsIds, options) {
    super();
    this.optionsIds = optionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.optionsIds.forEach(optionId => {
      const optionValue = optionsValues.get(optionId);
      const option = this.options.get(optionId);
      if (optionValue?.length > 0 && optionValue.charAt(0) === optionValue.charAt(0).toLocaleLowerCase()) {
        issues.push(translate('validators.invalidFirstLetter', {
          description: option.description,
        }));
      }
    });
    return issues;
  }
}

module.exports = FirstLetterValidator;
