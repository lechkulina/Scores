const {OptionId} = require('../options/CommonOptions');
const PollOption = require('../options/PollOption');
const PollQuestionOption = require('../options/PollQuestionOption');
const {PollValidator, PollQuestionValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class RemovePollQuestionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.poll = this.getOptionValue(OptionId.Poll);
    this.question = this.getOptionValue(OptionId.PollQuestion);
    this.questionDescription = formatEllipsis(this.question.description, autoCompeteNameLimit);
    return interaction.createMessage({
      content: this.translate('commands.removePollQuestion.messages.confirmation', {
        pollName: this.poll.name,
        questionDescription: this.questionDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removePollQuestion(this.question.id);
        return this.translate('commands.removePollQuestion.messages.success', {
          pollName: this.poll.name,
          questionDescription: this.questionDescription,
        });
      } catch (error) {
        console.error(`Failed to remove poll question - got error`, error);
        return this.translate('commands.removePollQuestion.errors.failure', {
          pollName: this.poll.name,
          questionDescription: this.questionDescription,
        });
      }
    });
  }
}

class RemovePollQuestionCommand extends Command {
  constructor(...props) {
    super('remove-poll-question', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removePollQuestion.description'));
    this.addOptions([
      new PollOption(OptionId.Poll, this.translate('commands.removePollQuestion.options.poll'),  this.dataModel),
      new PollQuestionOption(OptionId.PollQuestion, OptionId.Poll, this.translate('commands.removePollQuestion.options.pollQuestion'),  this.dataModel),
    ]);
    this.addValidators([
      new PollValidator(OptionId.Poll, this.dataModel),
      new PollQuestionValidator(OptionId.PollQuestion, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemovePollQuestionHandler(...props);
  }
}

module.exports = RemovePollQuestionCommand;
