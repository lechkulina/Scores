const Validator = require('./Validator');

class ReasonValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const reasonId = optionsValues.get(this.optionId);
    try {
      const reason = await this.dataModel.getReason(reasonId);
      if (reason) {
        optionsValues.set(this.optionId, reason);
      } else {
        issues.push(translate('validators.unknownReason', {
          reasonId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch reason ${reasonId} data - got error`, error);
      issues.push(translate('validators.reasonFetchFailure', {
        reasonId,
      }));
    }
    return issues;
  }
}

module.exports = ReasonValidator;
