const Validator = require('./Validator');

class ContestVoteValidator extends Validator {
  constructor(voteOptionId, dataModel) {
    super();
    this.voteOptionId = voteOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const voteId = optionsValues.get(this.voteOptionId);
    try {
      const vote = await this.dataModel.getContestVote(voteId);
      if (vote) {
        optionsValues.set(this.voteOptionId, vote);
      } else {
        issues.push(translate('validators.unknownContestVote', {
          voteId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest vote ${voteId} data - got error`, error);
      issues.push(translate('validators.contestVoteFetchFailure', {
        voteId,
      }));
    }
    return issues;
  }
}

module.exports = ContestVoteValidator;
