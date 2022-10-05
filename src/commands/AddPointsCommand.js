const PointsCategoryOption = require('../options/PointsCategoryOption');
const {OptionId, UserOption, NumberOption} = require('../options/CommonOptions');
const {
  PointsValueValidator,
  PointsCategoryValidator,
  UserValidator,
  PointsGiverValidator,
} = require('../validators/validators');
const InteractionHandler = require('../InteractionHandler');
const {ButtonId, createActionRow, createButton} = require('../Components');
const {Entities} = require('../Formatters');
const {SettingId} = require('../Settings');
const Command = require('./Command');

class AddPointsInteractionHandler extends InteractionHandler {
  async handleCommandInteraction(interaction) {
    this.user = this.getOptionValue(OptionId.User);
    this.category = this.getOptionValue(OptionId.PointsCategory);
    this.points = this.getOptionValue(OptionId.Points);
    try {
      const guildId = interaction.guildID;
      const giverId = interaction.member.user.id;
      this.giver = await this.clientHandler.findUser(guildId, giverId);
      await this.dataModel.addPoints(
        this.points,
        this.category.id,
        this.user.id,
        this.user.username,
        this.giver.id,
        this.giver.username,
        guildId
      );
    } catch (error) {
      this.markAsDone();
      return interaction.createMessage(this.translate('commands.addPoints.errors.failure', {
        points: this.points,
        userName: this.user.username,
      }));
    }
    return interaction.createMessage({
      content: this.translate('commands.addPoints.messages.success', {
        points: this.points,
        userName: this.user.username,
        categoryName: this.category.name,
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
    const channel = await this.clientHandler.createDirectMessagesChannel(interaction.guildID, this.user.id);
    await channel.createMessage(this.translate('commands.addPoints.messages.directMessage', {
      giverName: this.giver.username,
      points: this.points,
      categoryName: this.category.name,
    }));
    return this.translate('commands.addPoints.messages.directMessageSent', {
      userName: this.user.username,
    });
  }

  // TODO move this to clientHandler
  async createPublicMessage(interaction) {
    const publicChannelId = this.settings.get(SettingId.PointsAnnouncementsChannelId);
    const channel = await this.clientHandler.findChannel(interaction.guildID, publicChannelId);
    if (!channel) {
      console.error('Unable to send public message - public channel is missing');
      return;
    }
    await channel.createMessage(this.translate('commands.addPoints.messages.publicMessage', {
      userName: this.user.username,
      points: this.points,
      categoryName: this.category.name,
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
      new PointsCategoryOption(OptionId.PointsCategory, this.translate('commands.addPoints.options.pointsCategory'), this.dataModel),
      new NumberOption(OptionId.Points, this.translate('commands.addPoints.options.points')),
    ]);
    this.addValidators([
      new PointsCategoryValidator(OptionId.PointsCategory, this.dataModel),
      new UserValidator(OptionId.User, this.clientHandler),
      new PointsValueValidator(OptionId.Points, OptionId.PointsCategory, this.options),
      new PointsGiverValidator(OptionId.User),
    ])
    return Promise.resolve();
  }

  createInteractionHandler(...props) {
    return new AddPointsInteractionHandler(...props);
  }
}

module.exports = AddPointsCommand;
