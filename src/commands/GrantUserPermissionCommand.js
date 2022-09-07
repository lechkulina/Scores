const CommandOption = require('../options/CommandOption');
const {OptionId, UserOption} = require('../options/CommonOptions');
const InteractionHandler = require('../InteractionHandler');
const Command = require('./Command');

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
      components: this.createConfirmationForm(),
    });
  }

  async handleComponentInteraction(interaction) {
    return this.handleConfirmationForm(interaction, async () => {
      try {
        await this.dataModel.addGuild(this.member.guild.id, this.member.guild.name);
        await this.dataModel.addUser(this.member.user.id, this.member.user.username, this.member.user.discriminator, this.member.guild.id);
        await this.dataModel.grantUserPermission(this.member.user.id, this.commandId);
        return this.translate('commands.grantUserPermission.messages.success', {
          commandId: this.commandId,
        });
      } catch (error) {
        return this.translate('commands.grantUserPermission.errors.failure', {
          commandId: this.commandId,
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
      new UserOption(this.translate('common.user')),
      new CommandOption(this.translate('common.command')),
    ]);
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new GrantRolePermissionInteractionHandler(...props);
  }
}

module.exports = GrantUserPermissionCommand;
