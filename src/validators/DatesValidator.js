const moment = require('moment');
const Validator = require('./Validator');

class DatesValidator extends Validator {
  constructor(optionsIds, settings, options) {
    super();
    this.optionsIds = optionsIds;
    this.settings = settings;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const dateInputFormat = await this.settings.get('dateInputFormat');
    const issues = [];
    this.optionsIds.forEach(optionId => {
      const option = this.options.get(optionId);
      const optionValue = optionsValues.get(optionId);
      const dateValue = moment(optionValue, dateInputFormat, true);
      if (dateValue.isValid()) {
        optionsValues.set(optionId, dateValue);
      } else {
        optionsValues.delete(optionId);
        issues.push(translate('validators.invalidDateFormat', {
          description: option.description,
          dateInputFormat,
        }));
      }
    });
    return issues;
  }
}

module.exports = DatesValidator;
