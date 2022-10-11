const {OptionId, StringOption} = require('../options/CommonOptions');
const PollOption = require('../options/PollOption');
const {StringsLengthsValidator, FirstLetterValidator, PollValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddPollQuestionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const poll = this.getOptionValue(OptionId.Poll);
    const description = this.getOptionValue(OptionId.Description);
    try {
      await this.dataModel.addPollQuestion(description, poll.id);
      return interaction.createMessage({
        content: this.translate('commands.addPollQuestion.messages.success', {
          pollName: poll.name,
        })
      });
    } catch (error) {
      console.error(`Failed to add poll question - got error`, error);
      return interaction.createMessage(this.translate('commands.addPollQuestion.errors.failure', {
        pollName: poll.name,
      }));
    }
  }
}

class AddPollQuestionCommand extends Command {
  constructor(...props) {
    super('add-poll-question', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addPollQuestion.description'));
    this.addOptions([
      new PollOption(OptionId.Poll, this.translate('commands.addPollQuestion.options.poll'),  this.dataModel),
      new StringOption(OptionId.Description, this.translate('commands.addPollQuestion.options.description')),
    ]);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    this.addValidators([
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new FirstLetterValidator([OptionId.Description], this.options),
      new PollValidator(OptionId.Poll, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddPollQuestionHandler(...props);
  }
}

module.exports = AddPollQuestionCommand;
