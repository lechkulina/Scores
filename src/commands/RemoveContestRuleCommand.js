const {OptionId} = require('../options/CommonOptions');
const ContestRuleOption = require('../options/ContestRuleOption');
const {ContestRuleValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class RemoveContestRuleHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.rule = this.getOptionValue(OptionId.ContestRule);
    this.ruleDescription = formatEllipsis(this.rule.description, autoCompeteNameLimit);
    return interaction.createMessage({
      content: this.translate('commands.removeContestRule.messages.confirmation', {
        ruleDescription: this.ruleDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.removeContestRule(this.rule.id, interaction.guildID);
        return this.translate('commands.removeContestRule.messages.success', {
          ruleDescription: this.ruleDescription,
        });
      } catch (error) {
        return this.translate('commands.removeContestRule.errors.failure', {
          ruleDescription: this.ruleDescription,
        });
      }
    });
  }
}

class RemoveContestRuleCommand extends Command {
  constructor(...props) {
    super('remove-contest-rule', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.removeContestRule.description'));
    this.addOptions([
      new ContestRuleOption(OptionId.ContestRule, this.translate('commands.removeContestRule.options.contestRule'), this.dataModel),
    ]);
    this.addValidators([
      new ContestRuleValidator(OptionId.ContestRule, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RemoveContestRuleHandler(...props);
  }
}

module.exports = RemoveContestRuleCommand;
