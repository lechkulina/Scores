const PointsCategoryOption = require('../options/PointsCategoryOption');
const {OptionId, StringOption, NumberOption} = require('../options/CommonOptions');
const {
  StringsLengthsValidator,
  FirstLetterValidator,
  NumbersValuesValidator,
  NumbersRangesValidator,
  PointsCategoryValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class ChangePointsCategoryHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.category = this.getOptionValue(OptionId.PointsCategory);
    return interaction.createMessage({
      content: this.translate('commands.changePointsCategory.messages.confirmation', {
        categoryName: this.category.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const name = this.getOptionValue(OptionId.Name);
    const min = this.getOptionValue(OptionId.Min);
    const max = this.getOptionValue(OptionId.Max);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changePointsCategory(this.category.id, name, min, max);
        return this.translate('commands.changePointsCategory.messages.success', {
          categoryName: this.category.name,
        });
      } catch (error) {
        return this.translate('commands.changePointsCategory.errors.failure', {
          categoryName: this.category.name,
        });
      }
    });
  }
}

class ChangePointsCategoryCommand extends Command {
  constructor(...props) {
    super('change-points-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changePointsCategory.description'));
    this.addOptions([
      new PointsCategoryOption(OptionId.PointsCategory, this.translate('commands.changePointsCategory.options.pointsCategory'), this.dataModel),
      new StringOption(OptionId.Name, this.translate('commands.changePointsCategory.options.name')),
      new NumberOption(OptionId.Min, this.translate('commands.changePointsCategory.options.min')),
      new NumberOption(OptionId.Max, this.translate('commands.changePointsCategory.options.max')),
    ]);
    const minNameLength = this.settings.get(SettingId.MinNameLength);
    const maxNameLength = this.settings.get(SettingId.MaxNameLength);
    this.addValidators([
      new StringsLengthsValidator(minNameLength, maxNameLength, [OptionId.Name], this.options),
      new FirstLetterValidator([OptionId.Name], this.options),
      new NumbersValuesValidator([OptionId.Min, OptionId.Max], this.options),
      new NumbersRangesValidator([
        [OptionId.Min, OptionId.Max]
      ], this.options),
      new PointsCategoryValidator(OptionId.PointsCategory, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangePointsCategoryHandler(...props);
  }
}

module.exports = ChangePointsCategoryCommand;
