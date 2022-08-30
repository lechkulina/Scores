const {CommandInteraction, AutocompleteInteraction, ComponentInteraction} = require('eris');
const CommandsCollection = require('./CommandsCollection');
const config = require('../config.js');

class InteractionHandlersManager {
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

  acquireInteractionHandler(interaction) {
    const interactionHandlerId = interaction.member.id;
    const interactionHandler = this.interactionHandlers.get(interactionHandlerId);
    if (interactionHandler) {
      return interactionHandler;
    }
    const commandName = interaction.data.name;
    const command = this.commands.findCommand(commandName);
    if (!command) {
      console.error(`Unable to handle interaction of unsupported command ${commandName}`);
      return interaction.acknowledge();
    }
    const optionsValues = command.createOptionsValues(interaction);
    const newInteractionHandler = command.createInteractionHandler(interactionHandlerId, optionsValues);
    this.interactionHandlers.set(interactionHandlerId, newInteractionHandler);
    return newInteractionHandler;
  }

  handleAutocompleteInteraction(interaction) {
    const focusedOption = interaction.data.options.find(option => option.focused);
    const option = this.commands.findOption(interaction.data.name, focusedOption?.name);
    if (!option) {
      return interaction.result([]);
    }
    return option.getAutoCompeteResults(interaction, this.dataModel, focusedOption?.value || '');
  }
  
  handleCommandInteraction(interaction) {
    const interactionHandler = this.acquireInteractionHandler(interaction);
    return interactionHandler.handleCommandInteraction(interaction, this.dataModel)
      .finally(result => {
        if (interactionHandler.isDone()) {
          this.interactionHandlers.delete(interactionHandler.getId());
        }
        return result;
      })
  }

  handleComponentInteraction(interaction) {
    const interactionHandler = this.acquireInteractionHandler(interaction);
    return interactionHandler.handleComponentInteraction(interaction, this.dataModel)
      .finally(result => {
        if (interactionHandler.isDone()) {
          this.interactionHandlers.delete(interactionHandler.getId());
        }
        return result;
      })
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

module.exports = InteractionHandlersManager;
