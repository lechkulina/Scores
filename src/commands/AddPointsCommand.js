const ReasonOption = require('../options/ReasonOption');
const {OptionId, UserOption, NumberOption} = require('../options/CommonOptions');
const {PointsValueValidator, ReasonValidator} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, createActionRow, createButton} = require('../Components');
const {Entities} = require('../Formatters');
const Command = require('./Command');

class AddPointsInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.member = await this.clientHandler.findMember(interaction.guildID, this.getOptionValue(OptionId.User));
    this.giver = await this.clientHandler.findMember(interaction.guildID, interaction.member.user.id);
    this.reason = this.getOptionValue(OptionId.Reason);
    this.points = this.getOptionValue(OptionId.Points);
    try {
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
        createActionRow([
          createButton(ButtonId.No, this.translate('common.no')),
          createButton(ButtonId.SendDirectMessage, this.translate('common.sendHimDirectMessage')),
          createButton(ButtonId.CreatePublicMessage, this.translate('common.createPublicMessage')),
          createButton(ButtonId.DoBoth, this.translate('common.doBoth')),
        ]),
      ],
    });
  }

  // TODO move this to clientHandler
  async sendDirectMessage(interaction) {
    const channel = await this.clientHandler.createDirectMessagesChannel(interaction.guildID, this.member.user.id);
    await channel.createMessage(this.translate('commands.addPoints.messages.directMessage', {
      giverName: this.giver.user.username,
      points: this.points,
      reasonName: this.reason.name,
    }));
    return this.translate('commands.addPoints.messages.directMessageSent', {
      userName: this.member.user.username,
    });
  }

  // TODO move this to clientHandler
  async createPublicMessage(interaction) {
    const publicChannelId = await this.settings.get('publicChannelId');
    const channel = await this.clientHandler.findChannel(interaction.guildID, publicChannelId);
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
  constructor(...props) {
    super('add-points', ...props);
  }

  initialize() {
    this.setDescription(this.translate('commands.addPoints.description'));
    this.addOptions([
      new UserOption(OptionId.User, this.translate('commands.addPoints.options.user')),
      new ReasonOption(OptionId.Reason, this.translate('commands.addPoints.options.reason')),
      new NumberOption(OptionId.Points, this.translate('commands.addPoints.options.points')),
    ]);
    this.addValidators([
      new PointsValueValidator(OptionId.Points, OptionId.Reason, this.dataModel, this.settings, this.options),
      new ReasonValidator(OptionId.Reason, this.dataModel),
    ])
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddPointsInteractionHandler(...props);
  }
}

module.exports = AddPointsCommand;
