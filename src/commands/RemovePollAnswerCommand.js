const {OptionId} = require('../options/CommonOptions');
const PollOption = require('../options/PollOption');
const PollQuestionOption = require('../options/PollQuestionOption');
const PollAnswerOption = require('../options/PollAnswerOption');
const {PollValidator, PollQuestionValidator, PollAnswerValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class RemovePollAnswerHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.question = this.getOptionValue(OptionId.PollQuestion);
    this.answer = this.getOptionValue(OptionId.PollAnswer);
    this.questionDescription = formatEllipsis(this.question.description, autoCompeteNameLimit);
    this.answerDescription = formatEllipsis(this.answer.description, autoCompeteNameLimit);
    return interaction.createMessage({
      content: this.translate('commands.removePollAnswer.messages.confirmation', {
        answerDescription: this.answerDescription,
        questionDescription: this.questionDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removePollAnswer(this.answer.id);
        return this.translate('commands.removePollAnswer.messages.success', {
          answerDescription: this.answerDescription,
          questionDescription: this.questionDescription,
        });
      } catch (error) {
        console.error(`Failed to remove poll answer - got error`, error);
        return this.translate('commands.removePollAnswer.errors.failure', {
          answerDescription: this.answerDescription,
          questionDescription: this.questionDescription,
        });
      }
    });
  }
}

class RemovePollAnswerCommand extends Command {
  constructor(...props) {
    super('remove-poll-answer', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removePollAnswer.description'));
    this.addOptions([
      new PollOption(OptionId.Poll, this.translate('commands.removePollAnswer.options.poll'),  this.dataModel),
      new PollQuestionOption(OptionId.PollQuestion, OptionId.Poll, this.translate('commands.removePollAnswer.options.pollQuestion'),  this.dataModel),
      new PollAnswerOption(OptionId.PollAnswer, OptionId.PollQuestion, this.translate('commands.removePollAnswer.options.pollAnswer'),  this.dataModel),
    ]);
    this.addValidators([
      new PollValidator(OptionId.Poll, this.dataModel),
      new PollQuestionValidator(OptionId.PollQuestion, this.dataModel),
      new PollAnswerValidator(OptionId.PollAnswer, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemovePollAnswerHandler(...props);
  }
}

module.exports = RemovePollAnswerCommand;
