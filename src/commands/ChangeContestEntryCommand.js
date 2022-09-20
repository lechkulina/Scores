const {OptionId, StringOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const ContestEntryOption = require('../options/ContestEntryOption');
const {StringsLengthsValidator, FirstLetterValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class ChangeContestEntryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    this.entry = await this.dataModel.getContestEntry(this.getOptionValue(OptionId.ContestEntry));
    return interaction.createMessage({
      content: this.translate('commands.changeContestEntry.messages.confirmation', {
        entryName: this.entry.name,
        contestName: this.contest.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const [name, description, url] = this.getOptionValues([
      OptionId.Name,
      OptionId.Description,
      OptionId.Url,
    ]);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContestEntry(this.entry.id, this.contest.id, name, description, url);
        return this.translate('commands.changeContestEntry.messages.success', {
          entryName: this.entry.name,
          contestName: this.contest.name,
        });
      } catch (error) {
        return this.translate('commands.changeContestEntry.errors.failure', {
          entryName: this.entry.name,
          contestName: this.contest.name,
        });
      }
    });
  }
}

class ChangeContestEntryCommand extends Command {
  constructor(...props) {
    super('change-contest-entry', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changeContestEntry.description'));
    this.addOptions([
      new ContestOption(ContestState.ReadyToSubmitEntries, this.translate('commands.changeContestEntry.options.contest')),
      new ContestEntryOption(this.translate('commands.changeContestEntry.options.contestEntry')),
      new StringOption(OptionId.Name, this.translate('commands.changeContestEntry.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.changeContestEntry.options.description')),
      new StringOption(OptionId.Url, this.translate('commands.changeContestEntry.options.url')),
    ]);
    this.addValidators([
      new StringsLengthsValidator([OptionId.Name], 'minNameLength', 'maxNameLength', this.settings, this.options),
      new StringsLengthsValidator([OptionId.Description], 'minDescriptionLength', 'maxDescriptionLength', this.settings, this.options),
      new StringsLengthsValidator([OptionId.Url], 'minUrlLength', 'maxUrlLength', this.settings, this.options),
      new FirstLetterValidator([OptionId.Name], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeContestEntryHandler(...props);
  }
}

module.exports = ChangeContestEntryCommand;
