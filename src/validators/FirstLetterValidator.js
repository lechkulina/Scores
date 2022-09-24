const Validator = require('./Validator');

class FirstLetterValidator extends Validator {
  constructor(stringOptionsIds, options) {
    super();
    this.stringOptionsIds = stringOptionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.stringOptionsIds.forEach(stringOptionId => {
      const option = this.options.get(stringOptionId);
      const value = optionsValues.get(stringOptionId);
      if (value?.length > 0 && value.charAt(0) === value.charAt(0).toLocaleLowerCase()) {
        issues.push(translate('validators.invalidFirstLetter', {
          description: option.description,
        }));
      }
    });
    return issues;
  }
}

module.exports = FirstLetterValidator;
