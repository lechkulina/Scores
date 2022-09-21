const Validator = require('./Validator');

class ContestVoteValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const contestVoteId = optionsValues.get(this.optionId);
    try {
      const vote = await this.dataModel.getContestVote(contestVoteId);
      if (vote) {
        optionsValues.set(this.optionId, vote);
      } else {
        issues.push(translate('validators.unknownContestVote', {
          contestVoteId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest vote ${contestVoteId} data - got error`, error);
      issues.push(translate('validators.contestVoteFetchFailure', {
        contestVoteId,
      }));
    }
    return issues;
  }
}

module.exports = ContestVoteValidator;
