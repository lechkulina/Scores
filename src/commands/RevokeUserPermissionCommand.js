const CommandOption = require('../options/CommandOption');
const {OptionId, UserOption} = require('../options/CommonOptions');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RevokeRolePermissionInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.member = await this.findMember(interaction.guildID, this.getOptionValue(OptionId.User));
    this.commandId = this.getOptionValue(OptionId.Command);
  }

  async handleCommandInteraction(interaction) {
    return interaction.createMessage({
      content: this.translate('commands.revokeUserPermission.messages.confirmation', {
        commandId: this.commandId,
        userName: this.member.user.username,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.revokeUserPermission(this.member.user.id, this.commandId);
        return this.translate('commands.revokeUserPermission.messages.success', {
          commandId: this.commandId,
        });
      } catch (error) {
        return this.translate('commands.revokeUserPermission.errors.failure', {
          commandId: this.commandId,
        });
      }
    });
  }
}

class RevokeUserPermissionCommand extends Command {
  constructor(...props) {
    super('revoke-user-permission', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.revokeUserPermission.description'));
    this.addOptions([
      new UserOption(this.translate('common.user')),
      new CommandOption(this.translate('common.command')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RevokeRolePermissionInteractionHandler(...props);
  }
}

module.exports = RevokeUserPermissionCommand;
