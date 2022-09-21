const Validator = require('./Validator');

class ContestEntryValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues) {
    const issues = [];
    const contestEntryId = optionsValues.get(this.optionId);
    try {
      this.entry = await this.dataModel.getContestEntry(contestEntryId);
      if (entry) {
        optionsValues.set(this.optionId, entry);
      } else {
        issues.push(translate('validators.unknownContestEntry', {
          contestEntryId,
        }));
      }
    } catch(error) {
      issues.push(translate('validators.contestEntryFetchFailure', {
        contestEntryId,
      }));
    }
    return issues;
  }
}

module.exports = ContestEntryValidator;
