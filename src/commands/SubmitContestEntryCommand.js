const {OptionId, StringOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {StringsLengthsValidator, FirstLetterValidator, ContestValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class SubmitContestEntryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const authorId = interaction.member.user.id;
    const [contest, name, description, url] = this.getOptionValues([
      OptionId.Contest,
      OptionId.Name,
      OptionId.Description,
      OptionId.Url,
    ]);
    try {
      const authorMember = await this.clientHandler.findMember(interaction.guildID, authorId);
      await this.dataModel.addUser(authorMember.user.id, authorMember.username, authorMember.user.discriminator, authorMember.guild.id);
      await this.dataModel.submitContestEntry(name, description, url, contest.id, authorMember.user.id);
      return interaction.createMessage({
        content: this.translate('commands.submitContestEntry.messages.success', {
          entryName: name,
          contestName: contest.name,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.submitContestEntry.errors.failure', {
        entryName: name,
        contestName: contest.name,
      }));
    }
  }
}

class SubmitContestEntryCommand extends Command {
  constructor(...props) {
    super('submit-contest-entry', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.submitContestEntry.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('commands.submitContestEntry.options.contest'), this.dataModel),
      new StringOption(OptionId.Name, this.translate('commands.submitContestEntry.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.submitContestEntry.options.description')),
      new StringOption(OptionId.Url, this.translate('commands.submitContestEntry.options.url')),
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
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new SubmitContestEntryHandler(...props);
  }
}

module.exports = SubmitContestEntryCommand;
