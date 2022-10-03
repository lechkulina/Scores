const PointsCategoryOption = require('../options/PointsCategoryOption');
const {OptionId} = require('../options/CommonOptions');
const {PointsCategoryValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RemovePointsCategoryHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.category = this.getOptionValue(OptionId.PointsCategory);
    return interaction.createMessage({
      content: this.translate('commands.removePointsCategory.messages.confirmation', {
        categoryName: this.category.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removePointsCategory(this.category.id);
        return this.translate('commands.removePointsCategory.messages.success', {
          categoryName: this.category.name,
        });
      } catch (error) {
        return this.translate('commands.removePointsCategory.errors.failure', {
          categoryName: this.category.name,
        });
      }
    });
  }
}

class RemovePointsCategoryCommand extends Command {
  constructor(...props) {
    super('remove-points-category', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removePointsCategory.description'));
    this.addOptions([
      new PointsCategoryOption(OptionId.PointsCategory, this.translate('commands.removePointsCategory.options.pointsCategory'), this.dataModel)
    ]);
    this.addValidators([
      new PointsCategoryValidator(OptionId.PointsCategory, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemovePointsCategoryHandler(...props);
  }
}

module.exports = RemovePointsCategoryCommand;
