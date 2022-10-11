const {OptionId, StringOption} = require('../options/CommonOptions');
const PollOption = require('../options/PollOption');
const PollQuestionOption = require('../options/PollQuestionOption');
const PollAnswerOption = require('../options/PollAnswerOption');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  PollValidator,
  PollQuestionValidator,
  PollAnswerValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class ChangeAnswerHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.question = this.getOptionValue(OptionId.PollQuestion);
    this.answer = this.getOptionValue(OptionId.PollAnswer);
    this.questionDescription = formatEllipsis(this.question.description, autoCompeteNameLimit);
    this.answerDescription = formatEllipsis(this.answer.description, autoCompeteNameLimit);
    return interaction.createMessage({
      content: this.translate('commands.changePollAnswer.messages.confirmation', {
        answerDescription: this.answerDescription,
        questionDescription: this.questionDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const description = this.getOptionValue(OptionId.Description);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changePollAnswer(this.answer.id, description);
        return this.translate('commands.changePollAnswer.messages.success', {
          answerDescription: this.answerDescription,
          questionDescription: this.questionDescription,
        });
      } catch (error) {
        console.error(`Failed to change poll answer - got error`, error);
        return this.translate('commands.changePollAnswer.errors.failure', {
          answerDescription: this.answerDescription,
          questionDescription: this.questionDescription,
        });
      }
    });
  }
}

class ChangePollAnswerCommand extends Command {
  constructor(...props) {
    super('change-poll-answer', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changePollAnswer.description'));
    this.addOptions([
      new PollOption(OptionId.Poll, this.translate('commands.changePollAnswer.options.poll'),  this.dataModel),
      new PollQuestionOption(OptionId.PollQuestion, OptionId.Poll, this.translate('commands.changePollAnswer.options.pollQuestion'),  this.dataModel),
      new PollAnswerOption(OptionId.PollAnswer, OptionId.PollQuestion, this.translate('commands.changePollAnswer.options.pollAnswer'),  this.dataModel),
      new StringOption(OptionId.Description, this.translate('commands.changePollAnswer.options.description')),
    ]);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    this.addValidators([
      new PollValidator(OptionId.Poll, this.dataModel),
      new PollQuestionValidator(OptionId.PollQuestion, this.dataModel),
      new PollAnswerValidator(OptionId.PollAnswer, this.dataModel),
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new FirstLetterValidator([OptionId.Description], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeAnswerHandler(...props);
  }
}

module.exports = ChangePollAnswerCommand;
