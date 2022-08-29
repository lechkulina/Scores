const {CommandInteraction, AutocompleteInteraction, ComponentInteraction} = require('eris');
const commands = require('./commands');
const {discord: discordConfig} = require('../config.js');

class InteractionHandlersManager {
  constructor(client, dataModel) {
    this.client = client;
    this.dataModel = dataModel;
    this.interactionHandlers = new Map();
  }

  acquireInteractionHandler(interaction) {
    const interactionHandlerId = interaction.member.id;
    const interactionHandler = this.interactionHandlers.get(interactionHandlerId);
    if (interactionHandler) {
      return interactionHandler;
    }
    const commandName = interaction.data.name;
    const command = commands.findCommand(commandName);
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
    const commandName = interaction.data.name;
    const focusedOptionName = interaction.data.options.find(option => option.focused)?.name;
    const option = commands.findOption(commandName, focusedOptionName);
    if (!option) {
      return interaction.result([]);
    }
    return option.getAutoCompeteResults(interaction, this.dataModel);
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

  registerCommands() {
    const commandsConfigs = commands.getConfig();
    return discordConfig.guildId
      ? this.client.bulkEditGuildCommands(discordConfig.guildId, commandsConfigs)
      : this.client.bulkEditCommands(commandsConfigs);
  }
}

module.exports = InteractionHandlersManager;
