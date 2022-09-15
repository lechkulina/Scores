const {OptionId, StringOption, NumberOption, BooleanOption} = require('../options/CommonOptions');
const {StringsLengthsValidator, FirstLetterValidator, NumbersValuesValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class AddContestVoteCategoryHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const [name, description, max, useByDefault] = this.getOptionValues([
      OptionId.Name,
      OptionId.Description,
      OptionId.Max,
      OptionId.UseByDefault
    ]);
    try {
      await this.dataModel.addContestVoteCategory(name, description, max, useByDefault);
      return interaction.createMessage({
        content: this.translate('commands.addContestVoteCategory.messages.success', {
          categoryName: name,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addContestVoteCategory.errors.failure'));
    }
  }
}

class AddContestVoteCategory extends Command {
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
    this.addValidators([
      new StringsLengthsValidator([OptionId.Name], 'minNameLength', 'maxNameLength', this.settings, this.options),
      new StringsLengthsValidator([OptionId.Description], 'minDescriptionLength', 'maxDescriptionLength', this.settings, this.options),
      new FirstLetterValidator([OptionId.Name], this.options),
      new NumbersValuesValidator([OptionId.Max], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestVoteCategoryHandler(...props);
  }
}

module.exports = AddContestVoteCategory;
