const {OptionId, StringOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  DatesValidator,
  DatesRangesValidator,
  NumbersValuesValidator
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class ChangeContestInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    return interaction.createMessage({
      content: this.translate('commands.changeContest.messages.confirmation', {
        contestName: this.contest.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const [name, description, announcementsThreshold, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate] = this.getOptionValues([
      OptionId.Name,
      OptionId.Description,
      OptionId.AnnouncementsThreshold,
      OptionId.ActiveBeginDate,
      OptionId.ActiveEndDate,
      OptionId.VotingBeginDate,
      OptionId.VotingEndDate,
    ]);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContest(
          this.contest.id,
          name,
          description,
          announcementsThreshold,
          activeBeginDate.valueOf(),
          activeEndDate.valueOf(),
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
      new ContestOption(this.translate('common.contest')),
      new StringOption(OptionId.Name, this.translate('commands.changeContest.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.changeContest.options.description')),
      new StringOption(OptionId.AnnouncementsThreshold, this.translate('commands.changeContest.options.announcementsThreshold')),
      new StringOption(OptionId.ActiveBeginDate, this.translate('commands.changeContest.options.activeBeginDate')),
      new StringOption(OptionId.ActiveEndDate, this.translate('commands.changeContest.options.activeEndDate')),
      new StringOption(OptionId.VotingBeginDate, this.translate('commands.changeContest.options.votingBeginDate')),
      new StringOption(OptionId.VotingEndDate, this.translate('commands.changeContest.options.votingEndDate')),
    ]);
    this.addValidators([
      new StringsLengthsValidator([OptionId.Name], 'minNameLength', 'maxNameLength', this.settings, this.options),
      new StringsLengthsValidator([OptionId.Description], 'minDescriptionLength', 'maxDescriptionLength', this.settings, this.options),
      new NumbersValuesValidator([OptionId.AnnouncementsThreshold], this.options),
      new FirstLetterValidator([OptionId.Name, OptionId.Description], this.options),
      new DatesValidator([
        OptionId.AnnouncementDate,
        OptionId.ActiveBeginDate,
        OptionId.ActiveEndDate,
        OptionId.VotingBeginDate,
        OptionId.VotingEndDate,
      ], this.settings, this.options),
      new DatesRangesValidator([
        [OptionId.AnnouncementDate, OptionId.ActiveBeginDate],
        [OptionId.ActiveBeginDate, OptionId.ActiveEndDate],
        [OptionId.VotingBeginDate, OptionId.VotingEndDate],
        [OptionId.ActiveBeginDate, OptionId.VotingBeginDate],
        [OptionId.VotingEndDate, OptionId.ActiveEndDate],
      ], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeContestInteractionHandler(...props);
  }
}

module.exports = ChangeContestCommand;
