const Validator = require('./Validator');

class ContestVoterValidator extends Validator {
  constructor(entryOptionId, dataModel) {
    super();
    this.entryOptionId = entryOptionId;
    this.dataModel = dataModel
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const entry = optionsValues.get(this.entryOptionId);
    try {
      const authorId = await this.dataModel.getContestEntryAuthorId(entry.id);
      if (authorId === interaction.member.user.id) {
        issues.push(translate('validators.invalidContestVoter'));
      }
    } catch(error) {
      console.error(`Failed to fetch contest entry author data - got error`, error);
      issues.push(translate('validators.contestEntryAuthorFetchFailure'));
    }
    return issues;
  }
}

module.exports = ContestVoterValidator;
