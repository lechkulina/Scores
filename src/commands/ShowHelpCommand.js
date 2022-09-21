const InteractionHandler = require('../InteractionHandler');
const {Entities} = require('../Formatters');
const Command = require('./Command');

class ShowHelpInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    const userId = interaction.member.user.id;
    const rolesIds = interaction.member.roles;
    const commands = await this.dataModel.getCommandsWithPermissions(userId, rolesIds);
    const allowedCommandsCount = commands.reduce((count, command) => {
      if (command.allowed) {
        count++;
      }
      return count;
    }, 0);
    try {
      return this.createLongMessage(interaction,
        [
          this.translate('commands.showHelp.messages.summary', {
            allowedCommandsCount,
          }),
          ...commands.map(command => {
            const translateKey = `commands.showHelp.messages.${command.allowed ? 'allowedCommand' : 'notAllowedCommand'}`;
            return this.translate(translateKey, {
              id: command.id,
              description: command.description,
            });
          })
        ].join(Entities.NewLine)
      );
    } catch (error) {
      return interaction.createMessage(this.translate('commands.showHelp.errors.failure'));
    }
  }
}

class ShowHelpCommand extends Command {
  constructor(...props) {
    super('show-help', ...props);
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
