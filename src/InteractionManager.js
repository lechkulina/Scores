const {CommandInteraction, AutocompleteInteraction, ComponentInteraction} = require('eris');
const {DataModel} = require('./DataModel');
const {Settings} = require('./Settings');
const TranslatorsFactory = require('./TranslatorsFactory');
const CommandsManager = require('./CommandsManager');
const {Entities} = require('./Formatters');
const MessagePublisher = require('./MessagePublisher');
const TasksScheduler = require('./TasksScheduler');
const ContestsAnnouncementsManager = require('./ContestsAnnouncementsManager');

class InteractionManager {
  constructor(clientHandler) {
    this.clientHandler = clientHandler;
    this.dataModel = new DataModel();
    this.settings = new Settings(this.dataModel);
    this.tasksScheduler = new TasksScheduler(this.settings);
    this.translatorsFactory = new TranslatorsFactory(this.settings);
    this.messagePublisher = new MessagePublisher(this.clientHandler, this.dataModel, this.settings);
    this.interactionHandlers = new Map();
  }

  async initialize() {
    await this.dataModel.initialize();
    await this.settings.initialize();
    await this.tasksScheduler.initialize();
    await this.translatorsFactory.initialize();
    await this.messagePublisher.initialize();
    this.translate = this.translatorsFactory.getTranslator();
    this.commandsManager = new CommandsManager(this.clientHandler, this.dataModel, this.settings, this.translate);
    this.contestsAnnouncementsManager = new ContestsAnnouncementsManager(
      this.dataModel,
      this.settings,
      this.tasksScheduler,
      this.messagePublisher,
      this.translate
    );
    await this.commandsManager.initialize();
    await this.contestsAnnouncementsManager.initialize();
  }

  uninitialize() {
    this.contestsAnnouncementsManager.uninitialize();
    this.messagePublisher.uninitialize();
  }

  async createInteractionHandler(interaction) {
    // look for the command that would handle the incoming interaction
    const commandId = interaction.data.name;
    const command = this.commandsManager.findCommand(commandId);
    if (!command) {
      await interaction.acknowledge();
      return;
    }
    // check if the user has the permission to execute this command
    const translate = this.translatorsFactory.getTranslator(interaction);
    const userId = interaction.member.user.id;
    const rolesIds = interaction.member.roles;
    const allowed = true; // await this.dataModel.isAllowed(userId, rolesIds, commandId);
    if (!allowed) {
      await interaction.createMessage({
        content: translate('commands.errors.notAllowed', {
          commandId,
        }),
      });
      return;
    }
    // validate options values
    const optionsValues = command.createOptionsValues(interaction);
    const issues = await command.validateOptionsValues(translate, optionsValues, interaction);
    if (issues.length > 0) {
      await interaction.createMessage({
        content: [
          translate('commands.errors.validationFailed', {
            count: issues.length,
          }),
          ...issues
        ].join(Entities.NewLine),
      });
      return;
    }
    // add new interaction handler
    const interactionHandler = command.createInteractionHandler(
      this.clientHandler,
      this.dataModel,
      this.settings,
      translate,
      optionsValues
    );
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
    const translate = this.translatorsFactory.getTranslator(interaction);
    return option.getAutoCompeteResults(interaction, optionValue, translate);
  }
  
  async handleCommandInteraction(interaction) {
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
