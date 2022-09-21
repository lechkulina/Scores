const CommandOption = require('../options/CommandOption');
const {OptionId, RoleOption} = require('../options/CommonOptions');
const {CommandValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class GrantRolePermissionInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.role = this.findRole(interaction.guildID, this.getOptionValue(OptionId.Role));
    this.command = this.getOptionValue(OptionId.Command);
    return interaction.createMessage({
      content: this.translate('commands.grantRolePermission.messages.confirmation', {
        commandId: this.command.id,
        roleName: this.role.name,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.addRole(this.role.id, this.role.name, this.role.guild.id);
        await this.dataModel.grantRolePermission(this.role.id, this.command.id);
        return this.translate('commands.grantRolePermission.messages.success', {
          commandId: this.command.id,
        });
      } catch (error) {
        return this.translate('commands.grantRolePermission.errors.failure', {
          commandId: this.command.id,
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
      new RoleOption(OptionId.Role, this.translate('common.role')),
      new CommandOption(OptionId.Command, this.translate('common.command')),
    ]);
    this.addValidators([
      new CommandValidator(OptionId.Command, this.dataModel),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new GrantRolePermissionInteractionHandler(...props);
  }
}

module.exports = GrantRolePermissionCommand;
