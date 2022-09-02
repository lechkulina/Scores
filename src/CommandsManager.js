const supportedCommands = require('./Commands/supportedCommands.js');
const config = require('../config.js');

class CommandsManager {
  constructor(client, translatorsFactory) {
    this.client = client;
    this.translatorsFactory = translatorsFactory;
    this.commands = new Map();
  }

  getConfig() {
    return Array.from(this.commands.keys()).map(key =>
      this.commands.get(key).getConfig()
    );
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
    const commandsArray = Array.from(this.commands.values());
    await Promise.all(commandsArray.map(command => command.initialize()));
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
