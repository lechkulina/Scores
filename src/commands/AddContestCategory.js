const {OptionId, StringOption, NumberOption, BooleanOption} = require('../options/CommonOptions');
const {StringsLengthsValidator, FirstLetterValidator, NumbersValuesValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class AddReasonInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const [name, description, max, useByDefault] = this.getOptionValues([
      OptionId.Name,
      OptionId.Description,
      OptionId.Max,
      OptionId.UseByDefault
    ]);
    try {
      await this.dataModel.addContestCategory(name, description, max, useByDefault);
      return interaction.createMessage({
        content: this.translate('commands.addContestCategory.messages.success', {
          categoryName: name,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addContestCategory.errors.failure'));
    }
  }
}

class AddContestCategory extends Command {
  constructor(...props) {
    super('add-contest-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addContestCategory.description'));
    this.addOptions([
      new StringOption(OptionId.Name, this.translate('commands.addContestCategory.options.name')),
      new StringOption(OptionId.Description, this.translate('commands.addContestCategory.options.description')),
      new NumberOption(OptionId.Max, this.translate('commands.addContestCategory.options.max')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.addContestCategory.options.useByDefault')),
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
    return new AddReasonInteractionHandler(...props);
  }
}

module.exports = AddContestCategory;
