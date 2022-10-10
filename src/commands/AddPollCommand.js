const {
  OptionId,
  StringOption,
  BooleanOption,
  ChannelOption,
} = require('../options/CommonOptions');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  DatesValidator,
  DatesRangesValidator,
  ChannelValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddPollHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const name = this.getOptionValue(OptionId.Name);
    const description = this.getOptionValue(OptionId.Description);
    const activeBeginDate = this.getOptionValue(OptionId.ActiveBeginDate);
    const activeEndDate = this.getOptionValue(OptionId.ActiveEndDate);
    const showUsersAnswers = this.getOptionValue(OptionId.ShowUsersAnswers);
    const showCorrectAnswers = this.getOptionValue(OptionId.ShowCorrectAnswers);
    const channel = this.getOptionValue(OptionId.Channel);
    try {
      await this.dataModel.addPoll(
        name,
        description,
        activeBeginDate.valueOf(),
        activeEndDate.valueOf(),
        showUsersAnswers,
        showCorrectAnswers,
        channel.id,
        channel.name,
        interaction.guildID
      );
      return interaction.createMessage({
        content: this.translate('commands.addPoll.messages.success', {
          pollName: name,
          channelName: channel.name,
        })
      });
    } catch (error) {
      console.error(`Failed to add poll ${name} - got error`, error);
      return interaction.createMessage(this.translate('commands.addPoll.errors.failure', {
        pollName: name,
        channelName: channel.name,
      }));
    }
  }
}

class AddPollCommand extends Command {
  constructor(...props) {
    super('add-poll', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addPoll.description'));
    this.addOptions([
      new StringOption(OptionId.Name, this.translate('commands.addPoll.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.addPoll.options.description')),
      new StringOption(OptionId.ActiveBeginDate, this.translate('commands.addPoll.options.activeBeginDate')),
      new StringOption(OptionId.ActiveEndDate, this.translate('commands.addPoll.options.activeEndDate')),
      new BooleanOption(OptionId.ShowUsersAnswers, this.translate('commands.addPoll.options.showUsersAnswers')),
      new BooleanOption(OptionId.ShowCorrectAnswers, this.translate('commands.addPoll.options.showCorrectAnswers')),
      new ChannelOption(OptionId.Channel, this.translate('common.channel')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    const dateAndTimeInputFormat = this.settings.get(SettingId.DateAndTimeInputFormat);
    this.addValidators([
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
    return new AddPollHandler(...props);
  }
}

module.exports = AddPollCommand;
