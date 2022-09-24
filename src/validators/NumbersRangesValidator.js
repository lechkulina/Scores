const Validator = require('./Validator');

class NumbersRangesValidator extends Validator {
  constructor(rangeOptionsIds, options) {
    super();
    this.rangeOptionsIds = rangeOptionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.rangeOptionsIds.forEach(([minOptionId, maxOptionId]) => {
      const minOption = this.options.get(minOptionId);
      const maxOption = this.options.get(maxOptionId);
      const min = optionsValues.get(minOptionId);
      const max = optionsValues.get(maxOptionId);
      if (min >= max) {
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
