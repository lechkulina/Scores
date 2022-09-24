const {OptionId} = require('../options/CommonOptions');
const ContestRuleOption = require('../options/ContestRuleOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestValidator, ContestRuleValidator} = require('../validators/validators');
const {ContestState} = require('../DataModel');
const {formatEllipsis} = require('../Formatters');
const {autoCompeteNameLimit} = require('../constants');
const Command = require('./Command');

class AssignContestRuleHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const contest = this.getOptionValue(OptionId.Contest);
    const rule = this.getOptionValue(OptionId.ContestRule);
    const ruleDescription = formatEllipsis(rule.description, autoCompeteNameLimit);
    try {
      await this.dataModel.assignContestRule(contest.id, rule.id);
      return interaction.createMessage(
          this.translate('commands.assignContestRule.messages.success', {
          contestName: contest.name,
          ruleDescription,
        })
      );
    } catch (error) {
      return interaction.createMessage(
        this.translate('commands.assignContestRule.errors.failure', {
          contestName: contest.name,
          ruleDescription,
        })
      );
    }
  }
}

class AssignContestRuleCommand extends Command {
  constructor(...props) {
    super('assign-contest-rule', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.assignContestRule.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, OptionId.Contest, this.translate('common.contest'), this.dataModel),
      new ContestRuleOption(OptionId.ContestRule, this.translate('commands.assignContestRule.options.contestRule'), this.dataModel),
    ]);
    this.addValidators([
      new ContestValidator(OptionId.Contest, this.dataModel),
      new ContestRuleValidator(OptionId.ContestRule, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AssignContestRuleHandler(...props);
  }
}

module.exports = AssignContestRuleCommand;
