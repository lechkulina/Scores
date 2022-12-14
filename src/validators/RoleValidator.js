const Validator = require('./Validator');

class RoleValidator extends Validator {
  constructor(roleOptionId, clientHandler) {
    super();
    this.roleOptionId = roleOptionId;
    this.clientHandler = clientHandler;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const roleId = optionsValues.get(this.roleOptionId);
    try {
      const role = this.clientHandler.findRole(interaction.guildID, roleId);
      if (role) {
        optionsValues.set(this.roleOptionId, role);
      } else {
        issues.push(translate('validators.unknownRole', {
          roleId,
        }));
      }
    } catch(error) {
      console.error(`Failed to find role ${roleId} data - got error`, error);
      issues.push(translate('validators.roleFetchFailure', {
        roleId,
      }));
    }
    return issues;
  }
}

module.exports = RoleValidator;
