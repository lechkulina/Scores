const {CommandInteraction, AutocompleteInteraction, ComponentInteraction} = require('eris');
const CommandsCollection = require('./CommandsCollection');
const config = require('../config.js');

class InteractionManager {
  constructor(client, dataModel) {
    this.client = client;
    this.dataModel = dataModel;
    this.commands = new CommandsCollection(require('./supportedCommands').map(ctor => new ctor()));
    this.interactionHandlers = new Map();
  }

  registerCommands() {
    const commandsConfigs = this.commands.getConfig();
    return config.discord.guildId
      ? this.client.bulkEditGuildCommands(config.discord.guildId, commandsConfigs)
      : this.client.bulkEditCommands(commandsConfigs);
  }

  async initialize() {
    await this.commands.initialize(this.dataModel);
    return this.registerCommands();
  }

  createInteractionHandler(commandInteraction) {
    const commandName = commandInteraction.data.name;
    const command = this.commands.findCommand(commandName);
    if (!command) {
      console.error(`Unable to handle interaction of unsupported command ${commandName}`);
      return;
    }
    const optionsValues = command.createOptionsValues(commandInteraction);
    return command.createInteractionHandler(optionsValues);
  }

  handleAutocompleteInteraction(autocompleteInteraction) {
    const focusedOption = autocompleteInteraction.data.options.find(option => option.focused);
    const option = this.commands.findOption(autocompleteInteraction.data.name, focusedOption?.name);
    if (!option) {
      return autocompleteInteraction.result([]);
    }
    return option.getAutoCompeteResults(autocompleteInteraction, this.dataModel, focusedOption?.value || '');
  }
  
  async handleCommandInteraction(commandInteraction) {
    await this.dataModel.addInteractionAuthor(commandInteraction);

    const interactionHandler = this.createInteractionHandler(commandInteraction);
    this.interactionHandlers.set(commandInteraction.id, interactionHandler);

    return interactionHandler.handleCommandInteraction(commandInteraction, this.dataModel)
      .finally(result => {
        if (interactionHandler.isDone()) {
          this.interactionHandlers.delete(commandInteraction.id);
        }
        return result;
      });
  }

  handleComponentInteraction(componentInteraction) {
    const commandInteraction = componentInteraction.message.interaction;
    const interactionHandler = this.interactionHandlers.get(commandInteraction.id);
    if (!interactionHandler) {
      console.warn('Unexcepted component interaction - ignoring it');
      componentInteraction.acknowledge();
      return;
    }
    return interactionHandler.handleComponentInteraction(componentInteraction, this.dataModel)
      .finally(result => {
        if (interactionHandler.isDone()) {
          this.interactionHandlers.delete(commandInteraction.id);
        }
        return result;
      });
  }

  handleInteraction(interaction) {
    if (interaction instanceof AutocompleteInteraction) {
      return this.handleAutocompleteInteraction(interaction);
    }
    if (interaction instanceof ComponentInteraction) {
      return this.handleComponentInteraction(interaction);
    }
    if (interaction instanceof CommandInteraction) {
      return this.handleCommandInteraction(interaction);
    }
    console.warn('Got unsupported type of interaction - ignoring it');
    return interaction.acknowledge();
  }
}

module.exports = InteractionManager;
