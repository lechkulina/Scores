const Validator = require('./Validator');

const pattern = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

class UrlValidator extends Validator {
  constructor(urlOptionsIds, options) {
    super();
    this.urlOptionsIds = urlOptionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.urlOptionsIds.forEach(urlOptionId => {
      const option = this.options.get(urlOptionId);
      const value = optionsValues.get(urlOptionId);
      if (value && !pattern.test(value)) {
        issues.push(translate('validators.invalidUrl', {
          optionId: urlOptionId,
          optionDescription: option.description,
        }));
      }
    });
    return issues;
  }
}

module.exports = UrlValidator;
