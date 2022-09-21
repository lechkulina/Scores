const Validator = require('./Validator');

class ContestEntryValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const contestEntryId = optionsValues.get(this.optionId);
    try {
      const entry = await this.dataModel.getContestEntry(contestEntryId);
      if (entry) {
        optionsValues.set(this.optionId, entry);
      } else {
        issues.push(translate('validators.unknownContestEntry', {
          contestEntryId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest entry ${contestEntryId} data - got error`, error);
      issues.push(translate('validators.contestEntryFetchFailure', {
        contestEntryId,
      }));
    }
    return issues;
  }
}

module.exports = ContestEntryValidator;
