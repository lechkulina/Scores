const Validator = require('./Validator');

class PollAnswerValidator extends Validator {
  constructor(pollAnswerOptionId, dataModel) {
    super();
    this.pollAnswerOptionId = pollAnswerOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const pollAnswerId = optionsValues.get(this.pollAnswerOptionId);
    try {
      const answer = await this.dataModel.getPollAnswer(pollAnswerId);
      if (answer) {
        optionsValues.set(this.pollAnswerOptionId, answer);
      } else {
        issues.push(translate('validators.unknownPollAnswer', {
          pollAnswerId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch poll answer ${pollAnswerId} data - got error`, error);
      issues.push(translate('validators.pollAnswerFetchFailure', {
        pollAnswerId,
      }));
    }
    return issues;
  }
}

module.exports = PollAnswerValidator;
