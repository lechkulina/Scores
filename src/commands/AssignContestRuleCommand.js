const {OptionId} = require('../options/CommonOptions');
const ContestRuleOption = require('../options/ContestRuleOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const {formatEllipsis} = require('../Formatters');
const {contestRuleDescriptionLimit} = require('../constants');
const Command = require('./Command');

class AssignContestRuleHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    const rule = await this.dataModel.getContestRule(this.getOptionValue(OptionId.ContestRule));
    const ruleDescription = formatEllipsis(rule.description, contestRuleDescriptionLimit);
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
      new ContestOption(ContestState.Any, this.translate('common.contest')),
      new ContestRuleOption(this.translate('commands.assignContestRule.options.contestRule')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AssignContestRuleHandler(...props);
  }
}

module.exports = AssignContestRuleCommand;
