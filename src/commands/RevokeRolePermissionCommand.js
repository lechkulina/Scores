const CommandOption = require('../options/CommandOption');
const {OptionId, RoleOption} = require('../options/CommonOptions');
const {CommandValidator, RoleValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RevokeRolePermissionInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.role = this.getOptionValue(OptionId.Role);
    this.command = this.getOptionValue(OptionId.Command);
    return interaction.createMessage({
      content: this.translate('commands.revokeRolePermission.messages.confirmation', {
        commandId: this.command.id,
        roleName: this.role.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.revokeRolePermission(this.role.id, this.command.id);
        return this.translate('commands.revokeRolePermission.messages.success', {
          commandId: this.command.id,
        });
      } catch (error) {
        return this.translate('commands.revokeRolePermission.errors.failure', {
          commandId: this.command.id,
        });
      }
    });
  }
}

class RevokeRolePermissionCommand extends Command {
  constructor(...props) {
    super('revoke-role-permission', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.revokeRolePermission.description'));
    this.addOptions([
      new RoleOption(OptionId.Role, this.translate('common.role')),
      new CommandOption(OptionId.Command, this.translate('common.command'), this.dataModel),
    ]);
    this.addValidators([
      new CommandValidator(OptionId.Command, this.dataModel),
      new RoleValidator(OptionId.Role, this.clientHandler),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RevokeRolePermissionInteractionHandler(...props);
  }
}

module.exports = RevokeRolePermissionCommand;
