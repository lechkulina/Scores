const {OptionId, StringOption} = require('../options/CommonOptions');
const PollOption = require('../options/PollOption');
const PollQuestionOption = require('../options/PollQuestionOption');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  PollValidator,
  PollQuestionValidator
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class ChangePollHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.poll = this.getOptionValue(OptionId.Poll);
    this.question = this.getOptionValue(OptionId.PollQuestion);
    this.questionDescription = formatEllipsis(this.question.description, autoCompeteNameLimit);
    return interaction.createMessage({
      content: this.translate('commands.changePollQuestion.messages.confirmation', {
        pollName: this.poll.name,
        questionDescription: this.questionDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const description = this.getOptionValue(OptionId.Description);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changePollQuestion(this.question.id, description);
        return this.translate('commands.changePollQuestion.messages.success', {
          pollName: this.poll.name,
          questionDescription: this.questionDescription,
        });
      } catch (error) {
        console.error(`Failed to change poll ${this.poll.name} from channel ${this.poll.channelName} - got error`, error);
        return this.translate('commands.changePollQuestion.errors.failure', {
          pollName: this.poll.name,
          questionDescription: this.questionDescription,
        });
      }
    });
  }
}

class ChangePollQuestionCommand extends Command {
  constructor(...props) {
    super('change-poll-question', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changePollQuestion.description'));
    this.addOptions([
      new PollOption(OptionId.Poll, this.translate('commands.changePollQuestion.options.poll'),  this.dataModel),
      new PollQuestionOption(OptionId.PollQuestion, OptionId.Poll, this.translate('commands.changePollQuestion.options.pollQuestion'),  this.dataModel),
      new StringOption(OptionId.Description, this.translate('commands.changePollQuestion.options.description')),
    ]);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    this.addValidators([
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new FirstLetterValidator([OptionId.Description], this.options),
      new PollValidator(OptionId.Poll, this.dataModel),
      new PollQuestionValidator(OptionId.PollQuestion, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangePollHandler(...props);
  }
}

module.exports = ChangePollQuestionCommand;
