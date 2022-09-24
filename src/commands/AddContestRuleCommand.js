const {OptionId, StringOption, BooleanOption} = require('../options/CommonOptions');
const {StringsLengthsValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {SettingId} = require('../Settings');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class AddContestRuleHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const [description, useByDefault] = this.getOptionValues([      
      OptionId.Description,
      OptionId.UseByDefault,
    ]);
    const ruleDescription = formatEllipsis(description, autoCompeteNameLimit);
    try {
      await this.dataModel.addContestRule(description, useByDefault, interaction.guildID);
      return interaction.createMessage({
        content: this.translate('commands.addContestRule.messages.success', {
          ruleDescription,
        })
      });
    } catch (error) {
      return interaction.createMessage(this.translate('commands.addContestRule.errors.failure', {
        ruleDescription,
      }));
    }
  }
}

class AddContestRuleCommand extends Command {
  constructor(...props) {
    super('add-contest-rule', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addContestRule.description'));
    this.addOptions([
      new StringOption(OptionId.Description, this.translate('commands.addContestRule.options.description')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.addContestRule.options.useByDefault')),
    ]);
    const minDescriptionLength = this.settings.get(SettingId.MinDescriptionLength);
    const maxDescriptionLength = this.settings.get(SettingId.MaxDescriptionLength);
    this.addValidators([
      new StringsLengthsValidator(minDescriptionLength, maxDescriptionLength, [OptionId.Description], this.options),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddContestRuleHandler(...props);
  }
}

module.exports = AddContestRuleCommand;
