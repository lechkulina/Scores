const {OptionId, StringOption} = require('../options/CommonOptions');
const PollOption = require('../options/PollOption');
const PollQuestionOption = require('../options/PollQuestionOption');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  PollValidator,
  PollQuestionValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class AddPollAnswerHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const question = this.getOptionValue(OptionId.PollQuestion);
    const questionDescription = formatEllipsis(question.description, autoCompeteNameLimit);
    const description = this.getOptionValue(OptionId.Description);
    try {
      await this.dataModel.addPollAnswer(description, question.id);
      return interaction.createMessage({
        content: this.translate('commands.addPollAnswer.messages.success', {
          questionDescription,
        })
      });
    } catch (error) {
      console.error(`Failed to add poll answer - got error`, error);
      return interaction.createMessage(this.translate('commands.addPollAnswer.errors.failure', {
        questionDescription,
      }));
    }
  }
}

class AddPollAnswerCommand extends Command {
  constructor(...props) {
    super('add-poll-answer', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addPollAnswer.description'));
    this.addOptions([
      new PollOption(OptionId.Poll, this.translate('commands.addPollAnswer.options.poll'),  this.dataModel),
      new PollQuestionOption(OptionId.PollQuestion, OptionId.Poll, this.translate('commands.addPollAnswer.options.pollQuestion'),  this.dataModel),
      new StringOption(OptionId.Description, this.translate('commands.addPollAnswer.options.description')),
    ]);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    this.addValidators([
      new PollValidator(OptionId.Poll, this.dataModel),
      new PollQuestionValidator(OptionId.PollQuestion, this.dataModel),
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new FirstLetterValidator([OptionId.Description], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddPollAnswerHandler(...props);
  }
}

module.exports = AddPollAnswerCommand;
