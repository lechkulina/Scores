const Validator = require('./Validator');

class UserValidator extends Validator {
  constructor(userOptionId, clientHandler) {
    super();
    this.userOptionId = userOptionId;
    this.clientHandler = clientHandler;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const guildId = interaction.guildID;
    const userId = optionsValues.get(this.userOptionId);
    try {
      const user = await this.clientHandler.findUser(guildId, userId);
      if (user) {
        optionsValues.set(this.userOptionId, user);
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

module.exports = UserValidator;


