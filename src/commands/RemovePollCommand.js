const {OptionId} = require('../options/CommonOptions');
const PollOption = require('../options/PollOption');
const {PollValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RemovePollHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.poll = this.getOptionValue(OptionId.Poll);
    return interaction.createMessage({
      content: this.translate('commands.removePoll.messages.confirmation', {
        pollName: this.poll.name,
        channelName: this.poll.channelName,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removePoll(this.poll.id);
        return this.translate('commands.removePoll.messages.success', {
          pollName: this.poll.name,
          channelName: this.poll.channelName,
        });
      } catch (error) {
        console.error(`Failed to remove poll ${this.poll.name} from channel ${this.poll.channelName} - got error`, error);
        return this.translate('commands.removePoll.errors.failure', {
          pollName: this.poll.name,
          channelName: this.poll.channelName,
        });
      }
    });
  }
}

class RemovePollCommand extends Command {
  constructor(...props) {
    super('remove-poll', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removePoll.description'));
    this.addOptions([
      new PollOption(OptionId.Poll, this.translate('commands.removePoll.options.poll'),  this.dataModel),
    ]);
    this.addValidators([
      new PollValidator(OptionId.Poll, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemovePollHandler(...props);
  }
}

module.exports = RemovePollCommand;
