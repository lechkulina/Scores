const CommandOption = require('../options/CommandOption');
const {OptionId, UserOption} = require('../options/CommonOptions');
const {CommandValidator, MemberValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class RevokeRolePermissionInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.member = this.getOptionValue(OptionId.User);
    this.command = this.getOptionValue(OptionId.Command);
    return interaction.createMessage({
      content: this.translate('commands.revokeUserPermission.messages.confirmation', {
        commandId: this.command.id,
        userName: this.member.user.username,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.revokeUserPermission(this.member.user.id, this.command.id);
        return this.translate('commands.revokeUserPermission.messages.success', {
          commandId: this.command.id,
        });
      } catch (error) {
        return this.translate('commands.revokeUserPermission.errors.failure', {
          commandId: this.command.id,
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
      new UserOption(OptionId.User, this.translate('common.user')),
      new CommandOption(OptionId.Command, this.translate('common.command'), this.dataModel),
    ]);
    this.addValidators([
      new CommandValidator(OptionId.Command, this.dataModel),
      new MemberValidator(OptionId.User, this.clientHandler),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new RevokeRolePermissionInteractionHandler(...props);
  }
}

module.exports = RevokeUserPermissionCommand;
