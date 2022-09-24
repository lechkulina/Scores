const Validator = require('./Validator');

class ContestRuleValidator extends Validator {
  constructor(ruleOptionId, dataModel) {
    super();
    this.ruleOptionId = ruleOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const ruleId = optionsValues.get(this.ruleOptionId);
    try {
      const rule = await this.dataModel.getContestRule(ruleId);
      if (rule) {
        optionsValues.set(this.ruleOptionId, rule);
      } else {
        issues.push(translate('validators.unknownContestRule', {
          ruleId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch contest rule ${ruleId} data - got error`, error);
      issues.push(translate('validators.contestRuleFetchFailure', {
        ruleId,
      }));
    }
    return issues;
  }
}

module.exports = ContestRuleValidator;
