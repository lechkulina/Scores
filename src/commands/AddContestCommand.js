const {OptionId, StringOption} = require('../options/CommonOptions');
const {StringsLengthsValidator, FirstLetterValidator, DatesValidator, DatesRangesValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class AddContestInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const [name, description, activeBeginDate, activeEndDate, votingBeginDate, votingEndDate] = this.getOptionValues([
      OptionId.Name,
      OptionId.Description,
      OptionId.ActiveBeginDate,
      OptionId.ActiveEndDate,
      OptionId.VotingBeginDate,
      OptionId.VotingEndDate,
    ]);
    try {
      await this.dataModel.addContest(
        interaction.guildID,
        name,
        description,
        activeBeginDate.unix(),
        activeEndDate.unix(),
        votingBeginDate.unix(),
        votingEndDate.unix()
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
      new StringOption(OptionId.ActiveBeginDate, this.translate('commands.addContest.options.activeBeginDate')),
      new StringOption(OptionId.ActiveEndDate, this.translate('commands.addContest.options.activeEndDate')),
      new StringOption(OptionId.VotingBeginDate, this.translate('commands.addContest.options.votingBeginDate')),
      new StringOption(OptionId.VotingEndDate, this.translate('commands.addContest.options.votingEndDate')),
    ]);
    this.addValidators([
      new StringsLengthsValidator([OptionId.Name], 'minNameLength', 'maxNameLength', this.settings, this.options),
      new StringsLengthsValidator([OptionId.Description], 'minDescriptionLength', 'maxDescriptionLength', this.settings, this.options),
      new FirstLetterValidator([OptionId.Name, OptionId.Description], this.options),
      new DatesValidator([
        OptionId.ActiveBeginDate,
        OptionId.ActiveEndDate,
        OptionId.VotingBeginDate,
        OptionId.VotingEndDate,
      ], this.settings, this.options),
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
