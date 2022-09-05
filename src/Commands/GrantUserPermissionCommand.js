const {Constants: {ButtonStyles}} = require('eris');
const CommandOption = require('../CommandOption');
const {OptionId, UserOption} = require('../Options');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, actionRow, button} = require('../Components');

class GrantRolePermissionInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.member = await this.findMember(interaction.guildID, this.getOptionValue(OptionId.User));
    this.commandId = this.getOptionValue(OptionId.Command);
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.grantUserPermission.messages.confirmation', {
        commandId: this.commandId,
        userName: this.member.user.username,
      }),
      components: [
        actionRow([
          button(ButtonId.No, this.translate('common.no')),
          button(ButtonId.Yes, this.translate('common.yes'), ButtonStyles.DANGER),
        ]),
      ],
    });
  }

  async grantUserPermission() {
    try {
      await this.dataModel.addGuild(this.member.guild.id, this.member.guild.name);
      await this.dataModel.addUser(this.member.user.id, this.member.user.username, this.member.user.discriminator, this.member.guild.id);
      await this.dataModel.grantUserPermission(this.member.user.id, this.commandId);
      return this.translate('commands.grantRolePermission.messages.success', {
        commandId: this.commandId,
      });
    } catch (error) {
      return this.translate('commands.grantRolePermission.errors.failure', {
        commandId: this.commandId,
      });
    }
  }

  async handleComponentInteraction(interaction) {
    this.markAsDone();
    const content = await (() => {
      const buttonId = interaction.data.custom_id;
      switch (buttonId) {
        case ButtonId.No:
          return Promise.resolve(this.translate('common.canceled'));
        case ButtonId.Yes:
          return this.grantUserPermission();
      }
    })();
    return interaction.createMessage(content);
  }
}

class GrantUserPermissionCommand extends Command {
  constructor(translate) {
    super(translate, 'grant-user-permission');
  }

  initialize() {
    this.setDescription(this.translate('commands.grantUserPermission.description'));
    this.addOption(new UserOption(this.translate('commands.grantUserPermission.options.user')));
    this.addOption(new CommandOption(this.translate('commands.grantRolePermission.options.command')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new GrantRolePermissionInteractionHandler(...props);
  }
}

module.exports = GrantUserPermissionCommand;
