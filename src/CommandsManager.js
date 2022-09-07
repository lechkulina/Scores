const config = require('../config.js');

class CommandsManager {
  constructor(client, dataModel, settings, translate) {
    this.client = client;
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
    require('./commands/commands.js').forEach(Command => {
      const command = new Command(this.dataModel, this.settings, this.translate);
      this.commands.set(command.id, command);
    });
    await this.initializeCommands();
    await this.registerCommands();
  }

  findCommand(commandId) {
    return this.commands.get(commandId);
  }

  findOption(commandId, optionId) {
    return this.findCommand(commandId)?.findOption(optionId);
  }
}

module.exports = CommandsManager;
