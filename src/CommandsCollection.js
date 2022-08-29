class CommandsCollection {
  constructor(commands = []) {
    this.commands = new Map();
    commands.forEach((command => {
      this.commands.set(command.name, command);
    }));
  }

  getConfig() {
    return Array.from(this.commands.keys()).map(key =>
      this.commands.get(key).getConfig()
    );
  }

  addCommand(command) {
    this.commands.set(command.name, command);
  }

  findCommand(commandName) {
    return this.commands.get(commandName);
  }

  findOption(commandName, optionName) {
    return this.findCommand(commandName)?.findOption(optionName);
  }
}

module.exports = CommandsCollection;