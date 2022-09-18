const {OptionId, StringOption, NumberOption, BooleanOption} = require('../options/CommonOptions');
const ContestOption = require('../options/ContestOption');
const {StringsLengthsValidator, FirstLetterValidator, NumbersValuesValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const Command = require('./Command');

class SubmitContestEntryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const authorId = interaction.member.user.id;
    const [contestId, name, description, url] = this.getOptionValues([
      OptionId.Contest,
      OptionId.Name,
      OptionId.Description,
      OptionId.Url,
    ]);
    try {
      const contest = await this.dataModel.getContest(contestId);
      const authorMember = await this.findMember(interaction.guildID, authorId);
      await this.dataModel.addUser(authorMember.user.id, authorMember.username, authorMember.user.discriminator, authorMember.guild.id);
      await this.dataModel.submitContestEntry(name, description, url, contestId, authorMember.user.id);
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
      new ContestOption(ContestState.ReadyToSubmitEntries, this.translate('commands.submitContestEntry.options.contest')),
      new StringOption(OptionId.Name, this.translate('commands.submitContestEntry.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.submitContestEntry.options.description')),
      new StringOption(OptionId.Url, this.translate('commands.submitContestEntry.options.url')),
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
    return new SubmitContestEntryHandler(...props);
  }
}

module.exports = SubmitContestEntryCommand;
