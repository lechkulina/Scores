const {OptionId} = require('../options/CommonOptions');
const AssignedContestRuleOption = require('../options/AssignedContestRuleOption');
const ContestOption = require('../options/ContestOption');
const InteractionHandler = require('../InteractionHandler');
const {ContestState} = require('../DataModel');
const {formatEllipsis} = require('../Formatters');
const {contestRuleDescriptionLimit} = require('../constants');
const Command = require('./Command');

class UnassignContestRuleHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.contest = await this.dataModel.getContest(this.getOptionValue(OptionId.Contest));
    this.rule = await this.dataModel.getContestRule(this.getOptionValue(OptionId.AssignedContestRule));
    this.ruleDescription = formatEllipsis(this.rule.description, contestRuleDescriptionLimit);
    return interaction.createMessage({
      content: this.translate('commands.unassignContestRule.messages.confirmation', {
        contestName: this.contest.name,
        ruleDescription: this.ruleDescription,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.unassignContestRule(this.contest.id, this.rule.id);
        return this.translate('commands.unassignContestRule.messages.success', {
          contestName: this.contest.name,
          ruleDescription: this.ruleDescription,
        });
      } catch (error) {
        return this.translate('commands.unassignContestRule.errors.failure', {
          contestName: this.contest.name,
          ruleDescription: this.ruleDescription,
        });
      }
    });
  }
}

class UnassignContestRuleCommand extends Command {
  constructor(...props) {
    super('unassign-contest-rule', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.unassignContestRule.description'));
    this.addOptions([
      new ContestOption(ContestState.Any, this.translate('common.contest')),
      new AssignedContestRuleOption(this.translate('commands.unassignContestRule.options.contestRule')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new UnassignContestRuleHandler(...props);
  }
}

module.exports = UnassignContestRuleCommand;
