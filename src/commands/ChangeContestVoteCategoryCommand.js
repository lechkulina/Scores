const {OptionId, StringOption, NumberOption, BooleanOption} = require('../options/CommonOptions');
const ContestVoteCategoryOption = require('../options/ContestVoteCategoryOption');
const {StringsLengthsValidator, FirstLetterValidator, NumbersValuesValidator, ContestVoteCategoryValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddContestVoteCategoryHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.category = this.getOptionValue(OptionId.ContestVoteCategory);
    return interaction.createMessage({
      content: this.translate('commands.changeContestVoteCategory.messages.confirmation', {
        categoryName: this.category.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const [name, description, max, useByDefault] = this.getOptionValues([
      OptionId.Name,
      OptionId.Description,
      OptionId.Max,
      OptionId.UseByDefault
    ]);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContestVoteCategory(this.category.id, name, description, max, useByDefault, interaction.guildID);
        return this.translate('commands.changeContestVoteCategory.messages.success', {
          categoryName: this.category.name,
        });
      } catch (error) {
        return this.translate('commands.changeContestVoteCategory.errors.failure', {
          categoryName: this.category.name,
        });
      }
    });
  }
}

class ChangeContestVoteCategoryCommand extends Command {
  constructor(...props) {
    super('change-contest-vote-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changeContestVoteCategory.description'));
    this.addOptions([
      new ContestVoteCategoryOption(OptionId.ContestVoteCategory, this.translate('commands.changeContestVoteCategory.options.contestVoteCategory'), this.dataModel),
      new StringOption(OptionId.Name, this.translate('commands.changeContestVoteCategory.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.changeContestVoteCategory.options.description')),
      new NumberOption(OptionId.Max, this.translate('commands.changeContestVoteCategory.options.max')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.changeContestVoteCategory.options.useByDefault')),
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
      new ContestVoteCategoryValidator(OptionId.ContestVoteCategory, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestVoteCategoryHandler(...props);
  }
}

module.exports = ChangeContestVoteCategoryCommand;
