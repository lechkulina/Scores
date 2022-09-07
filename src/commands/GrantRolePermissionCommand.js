const {Constants: {ButtonStyles}} = require('eris');
const CommandOption = require('../CommandOption');
const {OptionId, RoleOption} = require('../Options');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, actionRow, button} = require('../Components');

class GrantRolePermissionInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.role = this.findRole(interaction.guildID, this.getOptionValue(OptionId.Role));
    this.commandId = this.getOptionValue(OptionId.Command);
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.grantRolePermission.messages.confirmation', {
        commandId: this.commandId,
        roleName: this.role.name,
      }),
      components: [
        actionRow([
          button(ButtonId.No, this.translate('common.no')),
          button(ButtonId.Yes, this.translate('common.yes'), ButtonStyles.DANGER),
        ]),
      ],
    });
  }

  async grantRolePermission() {
    try {
      await this.dataModel.addRole(this.role.id, this.role.name, this.role.guild.id);
      await this.dataModel.grantRolePermission(this.role.id, this.commandId);
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
          return this.grantRolePermission();
      }
    })();
    return interaction.createMessage(content);
  }
}

class GrantRolePermissionCommand extends Command {
  constructor(translate) {
    super(translate, 'grant-role-permission');
  }

  initialize() {
    this.setDescription(this.translate('commands.grantRolePermission.description'));
    this.addOption(new RoleOption(this.translate('common.role')));
    this.addOption(new CommandOption(this.translate('common.command')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new GrantRolePermissionInteractionHandler(...props);
  }
}

module.exports = GrantRolePermissionCommand;
