const {OptionId, StringOption, NumberOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  DatesValidator,
  DatesRangesValidator,
  NumbersValuesValidator,
  ContestValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class ChangeContestInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.contest = this.getOptionValue(OptionId.Contest);
    return interaction.createMessage({
      content: this.translate('commands.changeContest.messages.confirmation', {
        contestName: this.contest.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const name = this.getOptionValue(OptionId.Name);
    const description = this.getOptionValue(OptionId.Description);
    const requiredCompletedVotingsCount = this.getOptionValue(OptionId.RequiredCompletedVotingsCount);
    const submittingEntriesBeginDate = this.getOptionValue(OptionId.SubmittingEntriesBeginDate);
    const votingBeginDate = this.getOptionValue(OptionId.VotingBeginDate);
    const votingEndDate = this.getOptionValue(OptionId.VotingEndDate);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContest(
          this.contest.id,
          name,
          description,
          requiredCompletedVotingsCount,
          submittingEntriesBeginDate.valueOf(),
          votingBeginDate.valueOf(),
          votingEndDate.valueOf()
        );
        return this.translate('commands.changeContest.messages.success', {
          contestName: this.contest.name,
        });
      } catch (error) {
        return this.translate('commands.changeContest.errors.failure', {
          contestName: this.contest.name,
        });
      }
    });
  }
}

class ChangeContestCommand extends Command {
  constructor(...props) {
    super('change-contest', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changeContest.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('common.contest'), this.dataModel),
      new StringOption(OptionId.Name, this.translate('commands.changeContest.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.changeContest.options.description')),
      new NumberOption(OptionId.RequiredCompletedVotingsCount, this.translate('commands.changeContest.options.requiredCompletedVotingsCount')),
      new StringOption(OptionId.SubmittingEntriesBeginDate, this.translate('commands.changeContest.options.submittingEntriesBeginDate')),
      new StringOption(OptionId.VotingBeginDate, this.translate('commands.changeContest.options.votingBeginDate')),
      new StringOption(OptionId.VotingEndDate, this.translate('commands.changeContest.options.votingEndDate')),
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
      new ContestValidator(OptionId.Contest, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeContestInteractionHandler(...props);
  }
}

module.exports = ChangeContestCommand;
