const Validator = require('./Validator');

class PollValidator extends Validator {
  constructor(pollOptionId, dataModel) {
    super();
    this.pollOptionId = pollOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const pollId = optionsValues.get(this.pollOptionId);
    try {
      const poll = await this.dataModel.getPoll(pollId);
      if (poll) {
        optionsValues.set(this.pollOptionId, poll);
      } else {
        issues.push(translate('validators.unknownPoll', {
          pollId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch poll ${pollId} data - got error`, error);
      issues.push(translate('validators.pollFetchFailure', {
        pollId,
      }));
    }
    return issues;
  }
}

module.exports = PollValidator;
