const Validator = require('./Validator');

class StringsLengthsValidator extends Validator {
  constructor(optionsIds, minKey, maxKey, settings, options) {
    super();
    this.optionsIds = optionsIds;
    this.minKey = minKey;
    this.maxKey = maxKey;
    this.settings = settings;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const [minLength, maxLength] = await this.settings.getAll([
      this.minKey,
      this.maxKey,
    ]);
    const issues = [];
    this.optionsIds.forEach(optionId => {
      const optionValue = optionsValues.get(optionId);
      const option = this.options.get(optionId);
      if (!optionValue || optionValue.length < minLength || optionValue.length > maxLength) {
        optionsValues.delete(optionId);
        issues.push(translate('validators.invalidLength', {
          description: option.description,
          min: minLength,
          max: maxLength,
        }));
      }
    });
    return issues;
  }
}

module.exports = StringsLengthsValidator;
