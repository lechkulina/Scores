const Validator = require('./Validator');

const pattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

class UrlValidator extends Validator {
  constructor(optionsIds, options) {
    super();
    this.optionsIds = optionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.optionsIds.forEach(optionId => {
      const option = this.options.get(optionId);
      const url = optionsValues.get(optionId);
      if (url && !pattern.test(url)) {
        issues.push(translate('validators.invalidUrl', {
          optionId,
          optionDescription: option.description,
        }));
      }
    });
    return issues;
  }
}

module.exports = UrlValidator;
