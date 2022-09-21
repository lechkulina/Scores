class CommandsManager {
  constructor(clientHandler, dataModel, settings, translate) {
    this.clientHandler = clientHandler;
    this.dataModel = dataModel;
    this.settings = settings;
    this.translate = translate;
    this.commands = new Map();
  }

  getConfig() {
    return Array.from(this.commands.keys()).map(key =>
      this.commands.get(key).getConfig()
    );
  }

  async initializeCommands() {
    const commandsArray = Array.from(this.commands.values());
    await Promise.all(commandsArray.map(command =>
      command.initialize()
    ));
    return Promise.all(commandsArray.map(command =>
      this.dataModel.addCommand(command.id, command.description)
    ));
  }

  async initialize() {
    require('./commands/commands.js').forEach(Command => {
      const command = new Command(this.clientHandler, this.dataModel, this.settings, this.translate);
      this.commands.set(command.id, command);
    });
    await this.initializeCommands();
    return this.clientHandler.registerCommands(this.getConfig());
  }

  findCommand(commandId) {
    return this.commands.get(commandId);
  }

  findOption(commandId, optionId) {
    return this.findCommand(commandId)?.findOption(optionId);
  }
}

module.exports = CommandsManager;
