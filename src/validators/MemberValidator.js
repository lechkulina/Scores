const Validator = require('./Validator');

class MemberValidator extends Validator {
  constructor(optionId, clientHandler) {
    super();
    this.optionId = optionId;
    this.clientHandler = clientHandler;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const userId = optionsValues.get(this.optionId);
    try {
      const member = await this.clientHandler.findMember(interaction.guildID, userId);
      if (member) {
        optionsValues.set(this.optionId, member);
      } else {
        issues.push(translate('validators.unknownUser', {
          userId,
        }));
      }
    } catch(error) {
      console.error(`Failed to find user ${userId} data - got error`, error);
      issues.push(translate('validators.userFetchFailure', {
        userId,
      }));
    }
    return issues;
  }
}

module.exports = MemberValidator;


