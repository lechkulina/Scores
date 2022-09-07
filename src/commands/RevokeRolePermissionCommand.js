const CommandOption = require('../options/CommandOption');
const {OptionId, RoleOption} = require('../options/CommonOptions');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RevokeRolePermissionInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.role = this.findRole(interaction.guildID, this.getOptionValue(OptionId.Role));
    this.commandId = this.getOptionValue(OptionId.Command);
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.revokeRolePermission.messages.confirmation', {
        commandId: this.commandId,
        roleName: this.role.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.revokeRolePermission(this.role.id, this.commandId);
        return this.translate('commands.revokeRolePermission.messages.success', {
          commandId: this.commandId,
        });
      } catch (error) {
        return this.translate('commands.revokeRolePermission.errors.failure', {
          commandId: this.commandId,
        });
      }
    });
  }
}

class RevokeRolePermissionCommand extends Command {
  constructor(translate) {
    super(translate, 'revoke-role-permission');
  }

  initialize() {
    this.setDescription(this.translate('commands.revokeRolePermission.description'));
    this.addOption(new RoleOption(this.translate('common.role')));
    this.addOption(new CommandOption(this.translate('common.command')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RevokeRolePermissionInteractionHandler(...props);
  }
}

module.exports = RevokeRolePermissionCommand;
