const Validator = require('./Validator');

class CommandValidator extends Validator {
  constructor(commandOptionId, dataModel) {
    super();
    this.commandOptionId = commandOptionId;
    this.dataModel = dataModel;
  }

  async validate(translate, optionsValues, interaction) {
    const issues = [];
    const commandId = optionsValues.get(this.commandOptionId);
    try {
      const command = await this.dataModel.getCommand(commandId);
      if (command) {
        optionsValues.set(this.commandOptionId, command);
      } else {
        issues.push(translate('validators.unknownCommand', {
          commandId,
        }));
      }
    } catch(error) {
      console.error(`Failed to fetch command ${commandId} data - got error`, error);
      issues.push(translate('validators.commandFetchFailure', {
        commandId,
      }));
    }
    return issues;
  }
}

module.exports = CommandValidator;

