const {OptionId, StringOption, NumberOption} = require('../options/CommonOptions');
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
    const name = this.getOptionValue(OptionId.Name);
    const description = this.getOptionValue(OptionId.Description);
    const requiredCompletedVotingsCount = this.getOptionValue(OptionId.RequiredCompletedVotingsCount);
    const submittingEntriesBeginDate = this.getOptionValue(OptionId.SubmittingEntriesBeginDate);
    const votingBeginDate = this.getOptionValue(OptionId.VotingBeginDate);
    const votingEndDate = this.getOptionValue(OptionId.VotingEndDate);
    try {
      await this.dataModel.addContest(
        name,
        description,
        requiredCompletedVotingsCount,
        submittingEntriesBeginDate.valueOf(),
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
      console.error(`Failed to add contest ${name} - got error`, error);
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
      new NumberOption(OptionId.RequiredCompletedVotingsCount, this.translate('commands.addContest.options.requiredCompletedVotingsCount')),
      new StringOption(OptionId.SubmittingEntriesBeginDate, this.translate('commands.addContest.options.submittingEntriesBeginDate')),
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
      new NumbersValuesValidator([OptionId.RequiredCompletedVotingsCount], this.options),
      new FirstLetterValidator([OptionId.Name, OptionId.Description], this.options),
      new DatesValidator(dateAndTimeInputFormat, [
        OptionId.SubmittingEntriesBeginDate,
        OptionId.VotingBeginDate,
        OptionId.VotingEndDate,
      ], this.options),
      new DatesRangesValidator([
        [OptionId.SubmittingEntriesBeginDate, OptionId.VotingBeginDate],
        [OptionId.VotingBeginDate, OptionId.VotingEndDate],
      ], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestInteractionHandler(...props);
  }
}

module.exports = AddContestCommand;
