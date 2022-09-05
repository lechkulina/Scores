const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');
const {Entities} = require('../Formatters');

class ShowHelpInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.markAsDone();
    try {
      const commands = await this.dataModel.getCommands();
      return interaction.createMessage({
        content: [
          this.translate('commands.showHelp.messages.summary', {
            commandsCount: commands.length,
          }),
          ...commands.map(({id, description}) => this.translate('commands.showHelp.messages.command', {
            id,
            description,
          }))
        ].join(Entities.NewLine),
      });
    } catch (error) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.showHelp.errors.failure', {
        userName: user.name,
      }));
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
