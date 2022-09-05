const {CommandInteraction, AutocompleteInteraction, ComponentInteraction} = require('eris');
const Settings = require('./Settings');
const TranslatorsFactory = require('./TranslatorsFactory');
const CommandsManager = require('./CommandsManager');

class InteractionManager {
  constructor(client, dataModel) {
    this.client = client;
    this.dataModel = dataModel;
    this.settings = new Settings(this.dataModel);
    this.translatorsFactory = new TranslatorsFactory(this.settings);
    this.commandsManager = new CommandsManager(this.client, this.translatorsFactory, this.dataModel);
    this.interactionHandlers = new Map();
  }

  async initialize() {
    await this.settings.initialize();
    await this.commandsManager.initialize();
  }

  async createInteractionHandler(interaction) {
    const commandId = interaction.data.name;
    const command = this.commandsManager.findCommand(commandId);
    if (!command) {
      await interaction.acknowledge();
      return;
    }
    const translate = await this.translatorsFactory.createTranslator(interaction);
    const userId = interaction.member.user.id;
    const rolesIds = interaction.member.roles;
    const allowed = await this.dataModel.isAllowed(userId, rolesIds, commandId);
    if (!allowed) {
      await interaction.createMessage({
        content: translate('commands.errors.notAllowed', {
          commandId,
        }),
      });
      return;
    }
    const optionsValues = command.createOptionsValues(interaction);
    const interactionHandler = command.createInteractionHandler(this.client, this.dataModel, this.settings, translate, optionsValues);
    await interactionHandler.initialize(interaction);
    this.interactionHandlers.set(interaction.id, interactionHandler);
    return interactionHandler;
  }

  removeInteractionHandler(interaction, interactionHandler) {
    if (interactionHandler.isDone()) {
      this.interactionHandlers.delete(interaction.id);
    }
  }

  async handleAutocompleteInteraction(interaction) {
    const focusedOption = interaction.data.options.find(option => option.focused);
    const option = this.commandsManager.findOption(interaction.data.name, focusedOption?.name);
    if (!option) {
      return interaction.result([]);
    }
    const optionValue = focusedOption?.value || '';
    const translate = await this.translatorsFactory.createTranslator(interaction);
    return option.getAutoCompeteResults(interaction, this.dataModel, translate, optionValue);
  }
  
  async handleCommandInteraction(interaction) {
    await this.dataModel.addInteractionAuthor(interaction);
    const interactionHandler = await this.createInteractionHandler(interaction);
    if (!interactionHandler) {
      return;
    }
    return interactionHandler.handleCommandInteraction(interaction)
      .finally(result => {
        this.removeInteractionHandler(interaction, interactionHandler);
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
        this.removeInteractionHandler(interaction, interactionHandler);
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
