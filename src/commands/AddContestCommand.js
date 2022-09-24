const {OptionId, StringOption} = require('../options/CommonOptions');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  DatesValidator,
  DatesRangesValidator, 
  NumbersValuesValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddContestInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const [
      name,
      description,
      announcementsThreshold,
      requiredCompletedVotingsCount,
      activeBeginDate,
      activeEndDate,
      votingBeginDate,
      votingEndDate
    ] = this.getOptionValues([
      OptionId.Name,
      OptionId.Description,
      OptionId.AnnouncementsThreshold,
      OptionId.RequiredCompletedVotingsCount,
      OptionId.ActiveBeginDate,
      OptionId.ActiveEndDate,
      OptionId.VotingBeginDate,
      OptionId.VotingEndDate,
    ]);
    try {
      await this.dataModel.addContest(
        name,
        description,
        announcementsThreshold,
        requiredCompletedVotingsCount,
        activeBeginDate.valueOf(),
        activeEndDate.valueOf(),
        votingBeginDate.valueOf(),
        votingEndDate.valueOf(),
        interaction.guildID
      );
      return interaction.createMessage({
        content: this.translate('commands.addContest.messages.success', {
          contestName: name,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addContest.errors.failure', {
        contestName: name,
      }));
    }
  }
}

class AddContestCommand extends Command {
  constructor(...props) {
    super('add-contest', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addContest.description'));
    this.addOptions([
      new StringOption(OptionId.Name, this.translate('commands.addContest.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.addContest.options.description')),
      new StringOption(OptionId.AnnouncementsThreshold, this.translate('commands.addContest.options.announcementThreshold')),
      new StringOption(OptionId.RequiredCompletedVotingsCount, this.translate('commands.addContest.options.requiredCompletedVotingsCount')),
      new StringOption(OptionId.ActiveBeginDate, this.translate('commands.addContest.options.activeBeginDate')),
      new StringOption(OptionId.ActiveEndDate, this.translate('commands.addContest.options.activeEndDate')),
      new StringOption(OptionId.VotingBeginDate, this.translate('commands.addContest.options.votingBeginDate')),
      new StringOption(OptionId.VotingEndDate, this.translate('commands.addContest.options.votingEndDate')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    const dateAndTimeInputFormat = this.settings.get(SettingId.DateAndTimeInputFormat);
    this.addValidators([
      new StringsLengthsValidator(minNameLength, maxNameLength, [OptionId.Name], this.options),
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new NumbersValuesValidator([OptionId.AnnouncementsThreshold, OptionId.RequiredCompletedVotingsCount], this.options),
      new FirstLetterValidator([OptionId.Name, OptionId.Description], this.options),
      new DatesValidator(dateAndTimeInputFormat, [
        OptionId.ActiveBeginDate,
        OptionId.ActiveEndDate,
        OptionId.VotingBeginDate,
        OptionId.VotingEndDate,
      ], this.options),
      new DatesRangesValidator([
        [OptionId.ActiveBeginDate, OptionId.ActiveEndDate],
        [OptionId.VotingBeginDate, OptionId.VotingEndDate],
        [OptionId.ActiveBeginDate, OptionId.VotingBeginDate],
        [OptionId.VotingEndDate, OptionId.ActiveEndDate],
      ], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestInteractionHandler(...props);
  }
}

module.exports = AddContestCommand;
