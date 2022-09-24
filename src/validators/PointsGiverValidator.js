const Validator = require('./Validator');

class PointsGiverValidator extends Validator {
  constructor(userOptionId) {
    super();
    this.userOptionId = userOptionId;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const member = optionsValues.get(this.userOptionId);
    if (member && member.user.id === interaction.member.user.id) {
      issues.push(translate('validators.invalidPointsGiver'));
    }
    return issues;
  }
}

module.exports = PointsGiverValidator;
