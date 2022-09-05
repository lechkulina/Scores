const supportedCommands = require('./Commands/supportedCommands.js');
const config = require('../config.js');

class CommandsManager {
  constructor(client, translatorsFactory, dataModel) {
    this.client = client;
    this.translatorsFactory = translatorsFactory;
    this.dataModel = dataModel;
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
    await Promise.all(commandsArray.map(command =>
      this.dataModel.addCommand(command.name, command.description)
    ));
  }

  registerCommands() {
    const commandsConfig = this.getConfig();
    return config.discord.guildId
      ? this.client.bulkEditGuildCommands(config.discord.guildId, commandsConfig)
      : this.client.bulkEditCommands(commandsConfig);
  }

  async initialize() {
    const translate = await this.translatorsFactory.createTranslator();
    supportedCommands.forEach(Command => {
      const command = new Command(translate);
      this.commands.set(command.name, command);
    });
    await this.initializeCommands();
    await this.registerCommands();
  }

  findCommand(commandName) {
    return this.commands.get(commandName);
  }

  findOption(commandName, optionName) {
    return this.findCommand(commandName)?.findOption(optionName);
  }
}

module.exports = CommandsManager;
