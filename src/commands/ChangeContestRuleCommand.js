const {OptionId, StringOption, BooleanOption} = require('../options/CommonOptions');
const {StringsLengthsValidator, ContestRuleValidator} = require('../validators/validators');
const ContestRuleOption = require('../options/ContestRuleOption');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class ChangeContestRuleHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.rule = this.getOptionValue(OptionId.ContestRule);
    this.ruleDescription = formatEllipsis(this.rule.description, autoCompeteNameLimit);
    return interaction.createMessage({
      content: this.translate('commands.changeContestRule.messages.confirmation', {
        ruleDescription: this.ruleDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    const [description, useByDefault] = this.getOptionValues([      
      OptionId.Description,
      OptionId.UseByDefault,
    ]);
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.changeContestRule(this.rule.id, description, useByDefault, interaction.guildID);
        return this.translate('commands.changeContestRule.messages.success', {
          ruleDescription: this.ruleDescription,
        });
      } catch (error) {
        return this.translate('commands.changeContestRule.errors.failure', {
          ruleDescription: this.ruleDescription,
        });
      }
    });
  }
}

class ChangeContestRuleCommand extends Command {
  constructor(...props) {
    super('change-contest-rule', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.changeContestRule.description'));
    this.addOptions([
      new ContestRuleOption(OptionId.ContestRule, this.translate('commands.changeContestRule.options.contestRule'), this.dataModel),
      new StringOption(OptionId.Description, this.translate('commands.changeContestRule.options.description')),
      new BooleanOption(OptionId.UseByDefault, this.translate('commands.changeContestRule.options.useByDefault')),
    ]);
    this.addValidators([
      new StringsLengthsValidator([OptionId.Description], 'minDescriptionLength', 'maxDescriptionLength', this.settings, this.options),
      new ContestRuleValidator(OptionId.ContestRule, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ChangeContestRuleHandler(...props);
  }
}

module.exports = ChangeContestRuleCommand;
