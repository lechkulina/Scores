const Validator = require('./Validator');

class ContestEntryValidator extends Validator {
  constructor(entryOptionId, dataModel) {
    super();
    this.entryOptionId = entryOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const entryId = optionsValues.get(this.entryOptionId);
    try {
      const entry = await this.dataModel.getContestEntry(entryId);
      if (entry) {
        optionsValues.set(this.entryOptionId, entry);
      } else {
        issues.push(translate('validators.unknownContestEntry', {
          entryId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest entry ${entryId} data - got error`, error);
      issues.push(translate('validators.contestEntryFetchFailure', {
        entryId,
      }));
    }
    return issues;
  }
}

module.exports = ContestEntryValidator;
