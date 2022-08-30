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

  findInteractionHandler(interaction) {
    return this.interactionHandlers.get(interaction.member.id);
  }

  removeInteractionHandler(interactionHandler) {
    this.interactionHandlers.delete(interactionHandler.getId());
  }

  createInteractionHandler(interaction) {
    const interactionHandlerId = interaction.member.id;
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
    const interruptedInteractionHandler = this.findInteractionHandler(interaction);
    if (interruptedInteractionHandler) {
      console.warn('Detected interrupted interaction - removing it');
      this.removeInteractionHandler(interruptedInteractionHandler);
    }
    const interactionHandler = this.createInteractionHandler(interaction);
    return interactionHandler.handleCommandInteraction(interaction, this.dataModel)
      .finally(result => {
        if (interactionHandler.isDone()) {
          this.removeInteractionHandler(interactionHandler);
        }
        return result;
      })
  }

  handleComponentInteraction(interaction) {
    const interactionHandler = this.findInteractionHandler(interaction);
    if (!interactionHandler) {
      console.warn('Unexcepted component interaction - ignoring it');
      interaction.acknowledge();
      return;
    }
    return interactionHandler.handleComponentInteraction(interaction, this.dataModel)
      .finally(result => {
        if (interactionHandler.isDone()) {
          this.removeInteractionHandler(interactionHandler);
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
