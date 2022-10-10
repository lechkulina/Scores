const Validator = require('./Validator');

class PollQuestionValidator extends Validator {
  constructor(pollQuestionOptionId, dataModel) {
    super();
    this.pollQuestionOptionId = pollQuestionOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const pollQuestionId = optionsValues.get(this.pollQuestionOptionId);
    try {
      const question = await this.dataModel.getPollQuestion(pollQuestionId);
      if (question) {
        optionsValues.set(this.pollQuestionOptionId, question);
      } else {
        issues.push(translate('validators.unknownPollQuestion', {
          pollQuestionId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch poll question ${pollQuestionId} data - got error`, error);
      issues.push(translate('validators.pollQuestionFetchFailure', {
        pollQuestionId,
      }));
    }
    return issues;
  }
}

module.exports = PollQuestionValidator;
