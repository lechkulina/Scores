const CommandOption = require('../options/CommandOption');
const {OptionId, RoleOption} = require('../options/CommonOptions');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

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
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
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
    });
  }
}

class GrantRolePermissionCommand extends Command {
  constructor(...props) {
    super('grant-role-permission', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.grantRolePermission.description'));
    this.addOptions([
      new RoleOption(this.translate('common.role')),
      new CommandOption(this.translate('common.command')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new GrantRolePermissionInteractionHandler(...props);
  }
}

module.exports = GrantRolePermissionCommand;
