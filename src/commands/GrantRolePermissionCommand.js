const CommandOption = require('../options/CommandOption');
const {OptionId, RoleOption} = require('../options/CommonOptions');
const {CommandValidator, RoleValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class GrantRolePermissionInteractionHandler extends InteractionHandler {
  handleCommandInteraction(interaction) {
    this.role = this.getOptionValue(OptionId.Role);
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
        const guildId = interaction.guildID;
        await this.dataModel.grantRolePermission(this.command.id, this.role.id, this.role.name, guildId);
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
      new CommandOption(OptionId.Command, this.translate('common.command'), this.dataModel),
    ]);
    this.addValidators([
      new CommandValidator(OptionId.Command, this.dataModel),
      new RoleValidator(OptionId.Role, this.clientHandler),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new GrantRolePermissionInteractionHandler(...props);
  }
}

module.exports = GrantRolePermissionCommand;
