const {
  OptionId,
  StringOption,
  BooleanOption,
  ChannelOption,
} = require('../options/CommonOptions');
const PollOption = require('../options/PollOption');
const {
  PollValidator,
  StringsLengthsValidator,
  FirstLetterValidator,
  DatesValidator,
  DatesRangesValidator,
  ChannelValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class ChangePollHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.poll = this.getOptionValue(OptionId.Poll);
    return interaction.createMessage({
      content: this.translate('commands.changePoll.messages.confirmation', {
        pollName: this.poll.name,
        channelName: this.poll.channelName,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const name = this.getOptionValue(OptionId.Name);
    const description = this.getOptionValue(OptionId.Description);
    const activeBeginDate = this.getOptionValue(OptionId.ActiveBeginDate);
    const activeEndDate = this.getOptionValue(OptionId.ActiveEndDate);
    const showAnswersCount = this.getOptionValue(OptionId.ShowAnswersCount);
    const showUsersThatAnswered = this.getOptionValue(OptionId.ShowUsersThatAnswered);
    const channel = this.getOptionValue(OptionId.Channel);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changePoll(
          this.poll.id,
          name,
          description,
          activeBeginDate.valueOf(),
          activeEndDate.valueOf(),
          showAnswersCount,
          showUsersThatAnswered,
          channel.id,
          channel.name,
          interaction.guildID
        );
        return this.translate('commands.changePoll.messages.success', {
          pollName: this.poll.name,
          channelName: this.poll.channelName,
        });
      } catch (error) {
        console.error(`Failed to change poll ${this.poll.name} from channel ${this.poll.channelName} - got error`, error);
        return this.translate('commands.changePoll.errors.failure', {
          pollName: this.poll.name,
          channelName: this.poll.channelName,
        });
      }
    });
  }
}

class ChangePollCommand extends Command {
  constructor(...props) {
    super('change-poll', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changePoll.description'));
    this.addOptions([
      new PollOption(OptionId.Poll, this.translate('commands.changePoll.options.poll'),  this.dataModel),
      new StringOption(OptionId.Name, this.translate('commands.changePoll.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.changePoll.options.description')),
      new StringOption(OptionId.ActiveBeginDate, this.translate('commands.changePoll.options.activeBeginDate')),
      new StringOption(OptionId.ActiveEndDate, this.translate('commands.changePoll.options.activeEndDate')),
      new BooleanOption(OptionId.ShowAnswersCount, this.translate('commands.changePoll.options.showAnswersCount')),
      new BooleanOption(OptionId.ShowUsersThatAnswered, this.translate('commands.changePoll.options.showUsersThatAnswered')),
      new ChannelOption(OptionId.Channel, this.translate('common.channel')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    const dateAndTimeInputFormat = this.settings.get(SettingId.DateAndTimeInputFormat);
    this.addValidators([
      new PollValidator(OptionId.Poll, this.dataModel),
      new StringsLengthsValidator(minNameLength, maxNameLength, [OptionId.Name], this.options),
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new FirstLetterValidator([OptionId.Name, OptionId.Description], this.options),
      new ChannelValidator(OptionId.Channel, this.clientHandler),
      new DatesValidator(dateAndTimeInputFormat, [
        OptionId.ActiveBeginDate,
        OptionId.ActiveEndDate,
      ], this.options),
      new DatesRangesValidator([
        [OptionId.ActiveBeginDate, OptionId.ActiveEndDate],
      ], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangePollHandler(...props);
  }
}

module.exports = ChangePollCommand;
