const CommandOption = require('../options/CommandOption');
const {OptionId, UserOption} = require('../options/CommonOptions');
const {CommandValidator, UserValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

class GrantRolePermissionInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.user = this.getOptionValue(OptionId.User);
    this.command = this.getOptionValue(OptionId.Command);
    return interaction.createMessage({
      content: this.translate('commands.grantUserPermission.messages.confirmation', {
        commandId: this.command.id,
        userName: this.user.username,
      }),
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        const guildId = interaction.guildID;
        await this.dataModel.grantUserPermission(this.command.id, this.user.id, this.user.username, guildId);
        return this.translate('commands.grantUserPermission.messages.success', {
          commandId: this.command.id,
        });
      } catch (error) {
        return this.translate('commands.grantUserPermission.errors.failure', {
          commandId: this.command.id,
        });
      }
    });
  }
}

class GrantUserPermissionCommand extends Command {
  constructor(...props) {
    super('grant-user-permission', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.grantUserPermission.description'));
    this.addOptions([
      new UserOption(OptionId.User, this.translate('common.user')),
      new CommandOption(OptionId.Command, this.translate('common.command'), this.dataModel),
    ]);
    this.addValidators([
      new CommandValidator(OptionId.Command, this.dataModel),
      new UserValidator(OptionId.User, this.clientHandler),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new GrantRolePermissionInteractionHandler(...props);
  }
}

module.exports = GrantUserPermissionCommand;
