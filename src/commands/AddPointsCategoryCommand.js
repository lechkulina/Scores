const {OptionId, StringOption, NumberOption} = require('../options/CommonOptions');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  NumbersValuesValidator,
  NumbersRangesValidator
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddPointsCategoryHandler extends InteractionHandler {
  initialize(interaction) {
    this.name = this.getOptionValue(OptionId.Name);
    this.min = this.getOptionValue(OptionId.Min);
    this.max = this.getOptionValue(OptionId.Max);
    return Promise.resolve();
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const guildId = interaction.guildID;
      await this.dataModel.addPointsCategory(this.name, this.min, this.max, guildId);
      return interaction.createMessage({
        content: this.translate('commands.addPointsCategory.messages.success', {
          categoryName: this.name,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addPointsCategory.errors.failure'));
    }
  }
}

class AddPointsCategoryCommand extends Command {
  constructor(...props) {
    super('add-points-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addPointsCategory.description'));
    this.addOptions([
      new StringOption(OptionId.Name, this.translate('commands.addPointsCategory.options.name')),
      new NumberOption(OptionId.Min, this.translate('commands.addPointsCategory.options.min')),
      new NumberOption(OptionId.Max, this.translate('commands.addPointsCategory.options.max')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    this.addValidators([
      new StringsLengthsValidator(minNameLength, maxNameLength, [OptionId.Name], this.settings, this.options),
      new FirstLetterValidator([OptionId.Name], this.options),
      new NumbersValuesValidator([OptionId.Min, OptionId.Max], this.options),
      new NumbersRangesValidator([
        [OptionId.Min, OptionId.Max]
      ], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddPointsCategoryHandler(...props);
  }
}

module.exports = AddPointsCategoryCommand;
