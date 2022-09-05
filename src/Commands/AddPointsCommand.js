const ReasonOption = require('../ReasonOption');
const {OptionId, UserOption, NumberOption} = require('../Options');
const Command = require('../Command');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, actionRow, button} = require('../Components');
const {Entities} = require('../Formatters');

class AddPointsInteractionHandler extends InteractionHandler {
  async initialize(interaction) {
    this.member = await this.findMember(interaction.guildID, this.getOptionValue(OptionId.User));
    this.giver = await this.findMember(interaction.guildID, interaction.member.user.id);
    this.reason = await this.dataModel.getReason(this.getOptionValue(OptionId.Reason));
    this.points = this.getOptionValue(OptionId.Points);
  }

  async handleCommandInteraction(interaction) {
    if (this.points < this.reason.min || this.points > this.reason.max) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.addPoints.errors.invalidRange', {
        reasonName: this.reason.name,
        min: this.reason.min,
        max: this.reason.max,
      }));
    }
    try {
      await this.dataModel.addGuild(this.member.guild.id, this.member.guild.name);
      await this.dataModel.addGuild(this.giver.guild.id, this.giver.guild.name);
      await this.dataModel.addUser(this.member.user.id, this.member.user.username, this.member.user.discriminator, this.member.guild.id);
      await this.dataModel.addUser(this.giver.user.id, this.giver.user.username, this.giver.user.discriminator, this.giver.guild.id);
      await this.dataModel.addPoints(this.points, this.member.user.id, this.giver.user.id, this.reason.id);
    } catch (error) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.addPoints.errors.failure', {
        points: this.points,
        userName: this.member.user.username,
      }));
    }
    return interaction.createMessage({
      content: this.translate('commands.addPoints.messages.success', {
        points: this.points,
        userName: this.member.user.username,
        reasonName: this.reason.name,
      }),
      components: [
        actionRow([
          button(ButtonId.No, this.translate('common.no')),
          button(ButtonId.SendDirectMessage, this.translate('buttons.sendHimDirectMessage')),
          button(ButtonId.CreatePublicMessage, this.translate('buttons.createPublicMessage')),
          button(ButtonId.DoBoth, this.translate('buttons.doBoth')),
        ]),
      ],
    });
  }

  async sendDirectMessage(interaction) {
    const channel = await this.createDirectMessagesChannel(interaction.guildID, this.member.user.id);
    await channel.createMessage(this.translate('commands.addPoints.messages.directMessage', {
      giverName: this.giver.user.username,
      points: this.points,
      reasonName: this.reason.name,
    }));
    return this.translate('commands.addPoints.messages.directMessageSent', {
      userName: this.member.user.username,
    });
  }

  async createPublicMessage(interaction) {
    const channel = await this.findPublicChannel(interaction.guildID);
    if (!channel) {
      console.error('Unable to send public message - public channel is missing');
      return;
    }
    await channel.createMessage(this.translate('commands.addPoints.messages.publicMessage', {
      userName: this.member.user.username,
      points: this.points,
      reasonName: this.reason.name,
    }));
    return this.translate('commands.addPoints.messages.publicMessageCreated', {
      channelName: channel.name,
    });
  }

  async handleComponentInteraction(interaction) {
    this.markAsDone();
    const content = await (() => {
      const buttonId = interaction.data.custom_id;
      switch (buttonId) {
        case ButtonId.No:
          return Promise.resolve(this.translate('common.done'));
        case ButtonId.SendDirectMessage:
          return this.sendDirectMessage(interaction);
        case ButtonId.CreatePublicMessage:
          return this.createPublicMessage(interaction);
        case ButtonId.DoBoth:
          return Promise.all([
            this.sendDirectMessage(interaction),
            this.createPublicMessage(interaction),
          ]).then(status => status.join(Entities.NewLine));
      }
    })();
    return interaction.createMessage(content);
  }
}

class AddPointsCommand extends Command {
  constructor(translate) {
    super(translate, 'add-points');
  }

  initialize() {
    this.setDescription(this.translate('commands.addPoints.description'));
    this.addOption(new UserOption(this.translate('commands.addPoints.options.user')));
    this.addOption(new ReasonOption(this.translate('commands.addPoints.options.reason')));
    this.addOption(new NumberOption(OptionId.Points, this.translate('commands.addPoints.options.points')));
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddPointsInteractionHandler(...props);
  }
}

module.exports = AddPointsCommand;
