const InteractionHandler = require('../InteractionHandler');
const {Entities} = require('../Formatters');
const Command = require('./Command');

class ShowHelpInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    const userId = interaction.member.user.id;
    const rolesIds = interaction.member.roles;
    this.commands = await this.dataModel.getCommandsWithPermissions(userId, rolesIds);
    this.allowedCommandsCount = this.commands.reduce((count, command) => {
      if (command.allowed) {
        count++;
      }
      return count;
    }, 0);
  }

  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      return interaction.createMessage({
        content: [
          this.translate('commands.showHelp.messages.summary', {
            allowedCommandsCount: this.allowedCommandsCount,
          }),
          ...this.commands.map(command => {
            const translateKey = `commands.showHelp.messages.${command.allowed ? 'allowedCommand' : 'notAllowedCommand'}`;
            return this.translate(translateKey, {
              id: command.id,
              description: command.description,
            });
          })
        ].join(Entities.NewLine),
      });
    } catch (error) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.showHelp.errors.failure'));
    }
  }
}

class ShowHelpCommand extends Command {
  constructor(translate) {
    super(translate, 'show-help');
  }

  initialize() {
    this.setDescription(this.translate('commands.showHelp.description'));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new ShowHelpInteractionHandler(...props);
  }
}

module.exports = ShowHelpCommand;
