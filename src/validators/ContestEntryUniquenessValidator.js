const Validator = require('./Validator');

class ContestEntryUniquenessValidator extends Validator {
  constructor(nameOptionId, urlOptionId, dataModel) {
    super();
    this.nameOptionId = nameOptionId;
    this.urlOptionId = urlOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const name = optionsValues.get(this.nameOptionId);
    const url = optionsValues.get(this.urlOptionId);
    if (!name || !url) {
      return issues;
    }
    try {
      const isUnique = await this.dataModel.isContestEntryUnique(name, url, interaction.guildID);
      if (!isUnique) {
        issues.push(translate('validators.contestEntryIsNotUnique'));
      }
    } catch(error) {
      console.error(`Failed to check contest entry uniqueness data - got error`, error);
      issues.push(translate('validators.contestEntryUniqueFetchFailure'));
    }
    return issues;
  }
}

module.exports = ContestEntryUniquenessValidator;
