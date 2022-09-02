const {CommandInteraction, AutocompleteInteraction, ComponentInteraction} = require('eris');
const CommandsCollection = require('./CommandsCollection');
const Settings = require('./Settings');
const config = require('../config.js');

class InteractionManager {
  constructor(client, dataModel) {
    this.client = client;
    this.dataModel = dataModel;
    this.settings = new Settings(dataModel);
    this.commands = new CommandsCollection(require('./supportedCommands').map(ctor => new ctor()));
    this.interactionHandlers = new Map();
  }

  registerCommands() {
    const commandsConfigs = this.commands.getConfig();
    return config.discord.guildId
      ? this.client.bulkEditGuildCommands(config.discord.guildId, commandsConfigs)
      : this.client.bulkEditCommands(commandsConfigs);
  }

  initialize() {
    return Promise.all([
      this.settings.initialize(),
      this.commands.initialize(this.dataModel),
      this.registerCommands(),
    ]);
  }

  createInteractionHandler(interaction) {
    const commandName = interaction.data.name;
    const command = this.commands.findCommand(commandName);
    if (!command) {
      console.error(`Unable to handle interaction of unsupported command ${commandName}`);
      return;
    }
    const optionsValues = command.createOptionsValues(interaction);
    return command.createInteractionHandler(this.client, this.dataModel, this.settings, optionsValues);
  }

  handleAutocompleteInteraction(interaction) {
    const focusedOption = interaction.data.options.find(option => option.focused);
    const option = this.commands.findOption(interaction.data.name, focusedOption?.name);
    if (!option) {
      return interaction.result([]);
    }
    return option.getAutoCompeteResults(interaction, this.dataModel, focusedOption?.value || '');
  }
  
  async handleCommandInteraction(interaction) {
    await this.dataModel.addInteractionAuthor(interaction);

    const interactionHandler = this.createInteractionHandler(interaction);
    this.interactionHandlers.set(interaction.id, interactionHandler);

    return interactionHandler.handleCommandInteraction(interaction)
      .finally(result => {
        if (interactionHandler.isDone()) {
          this.interactionHandlers.delete(interaction.id);
        }
        return result;
      });
  }

  handleComponentInteraction(interaction) {
    const commandInteraction = interaction.message.interaction;
    const interactionHandler = this.interactionHandlers.get(commandInteraction.id);
    if (!interactionHandler) {
      console.warn('Unexcepted component interaction - ignoring it');
      interaction.acknowledge();
      return;
    }
    return interactionHandler.handleComponentInteraction(interaction)
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
