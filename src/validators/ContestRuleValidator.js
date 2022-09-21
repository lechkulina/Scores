const Validator = require('./Validator');

class ContestRuleValidator extends Validator {
  constructor(optionId, dataModel) {
    super();
    this.optionId = optionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues) {
    const issues = [];
    const contestRuleId = optionsValues.get(this.optionId);
    try {
      const rule = await this.dataModel.getContestRule(contestRuleId);
      if (rule) {
        optionsValues.set(this.optionId, rule);
      } else {
        issues.push(translate('validators.unknownContestRule', {
          contestRuleId,
        }));
      }
    } catch(error) {
      issues.push(translate('validators.contestRuleFetchFailure', {
        contestRuleId,
      }));
    }
    return issues;
  }
}

module.exports = ContestRuleValidator;
