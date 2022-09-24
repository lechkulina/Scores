const moment = require('moment');
const Validator = require('./Validator');

class DatesValidator extends Validator {
  constructor(inpoutFormat, dateOptionsIds, options) {
    super();
    this.inpoutFormat = inpoutFormat;
    this.dateOptionsIds = dateOptionsIds;
    this.options = options;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    this.dateOptionsIds.forEach(dateOptionId => {
      const option = this.options.get(dateOptionId);
      const value = optionsValues.get(dateOptionId);
      const date = moment(value, this.inpoutFormat, true);
      if (date.isValid()) {
        optionsValues.set(dateOptionId, date);
      } else {
        optionsValues.delete(dateOptionId); // prevent any additional validation on this option
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
