const {OptionId, StringOption, NumberOption, BooleanOption} = require('../options/CommonOptions');
const {StringsLengthsValidator, FirstLetterValidator, NumbersValuesValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddContestVoteCategoryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const name = this.getOptionValue(OptionId.Name);
    const description = this.getOptionValue(OptionId.Description);
    const max = this.getOptionValue(OptionId.Max);
    const useByDefault = this.getOptionValue(OptionId.UseByDefault);
    try {
      await this.dataModel.addContestVoteCategory(name, description, max, useByDefault, interaction.guildID);
      return interaction.createMessage({
        content: this.translate('commands.addContestVoteCategory.messages.success', {
          categoryName: name,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addContestVoteCategory.errors.failure', {
        categoryName: name,
      }));
    }
  }
}

class AddContestVoteCategoryCommand extends Command {
  constructor(...props) {
    super('add-contest-vote-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addContestVoteCategory.description'));
    this.addOptions([
      new StringOption(OptionId.Name, this.translate('commands.addContestVoteCategory.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.addContestVoteCategory.options.description')),
      new NumberOption(OptionId.Max, this.translate('commands.addContestVoteCategory.options.max')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.addContestVoteCategory.options.useByDefault')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    this.addValidators([
      new StringsLengthsValidator(minNameLength, maxNameLength, [OptionId.Name], this.options),
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
      new FirstLetterValidator([OptionId.Name], this.options),
      new NumbersValuesValidator([OptionId.Max], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestVoteCategoryHandler(...props);
  }
}

module.exports = AddContestVoteCategoryCommand;
