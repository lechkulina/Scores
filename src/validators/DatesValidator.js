const moment = require('moment');
const Validator = require('./Validator');

class DatesValidator extends Validator {
  constructor(inpoutFormat, optionsIds, options) {
    super();
    this.inpoutFormat = inpoutFormat;
    this.optionsIds = optionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.optionsIds.forEach(optionId => {
      const option = this.options.get(optionId);
      const optionValue = optionsValues.get(optionId);
      const dateValue = moment(optionValue, this.inpoutFormat, true);
      if (dateValue.isValid()) {
        optionsValues.set(optionId, dateValue);
      } else {
        optionsValues.delete(optionId);
        issues.push(translate('validators.invalidDateFormat', {
          description: option.description,
          dateInputFormat: this.inpoutFormat,
        }));
      }
    });
    return issues;
  }
}

module.exports = DatesValidator;
