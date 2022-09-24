const {OptionId, StringOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const ContestEntryOption = require('../options/ContestEntryOption');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  ContestValidator,
  ContestEntryValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class ChangeContestEntryHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.contest = this.getOptionValue(OptionId.Contest);
    this.entry = this.getOptionValue(OptionId.ContestEntry);
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
      new ContestOption(ContestState.OpenForSubmittingEntries, OptionId.Contest, this.translate('commands.changeContestEntry.options.contest'), this.dataModel),
      new ContestEntryOption(true, OptionId.ContestEntry, this.translate('commands.changeContestEntry.options.contestEntry'), this.dataModel),
      new StringOption(OptionId.Name, this.translate('commands.changeContestEntry.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.changeContestEntry.options.description')),
      new StringOption(OptionId.Url, this.translate('commands.changeContestEntry.options.url')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    const minUrlLength = this.settings.get(SettingId.MinUrlLength);
    const maxUrlLength = this.settings.get(SettingId.MaxUrlLength);
    this.addValidators([
      new StringsLengthsValidator(minNameLength, maxNameLength, [OptionId.Name], this.options),
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new StringsLengthsValidator(minUrlLength, maxUrlLength, [OptionId.Url], this.options),
      new FirstLetterValidator([OptionId.Name], this.options),
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestEntryValidator(OptionId.ContestEntry, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeContestEntryHandler(...props);
  }
}

module.exports = ChangeContestEntryCommand;
