const {Constants: {ApplicationCommandTypes, ApplicationCommandOptionTypes, ComponentTypes, ButtonStyles}} = require('eris');
const UserOption = require('./UserOption');
const ReasonOption = require('./ReasonOption');
const Option = require('./Option');
const Command = require('./Command');
const InteractionHandler = require('./InteractionHandler');

const userOptionName = 'user';
const reasonOptionName = 'reason';
const pointsOptionName = 'points';
const commentOptionName = 'comment';

const noButtonId = 'noButtonId';
const sendDirectMessageButtonId = 'sendDirectMessageButtonId';
const createPublicMessageButtonId = 'createPublicMessageButtonId';
const doBothButtonId = 'doBothButtonId';

class AddScoreInteractionHandler extends InteractionHandler {
  constructor(client, dataModel, settings, optionsValues) {
    super(client, dataModel, settings, optionsValues);
    this.user = this.dataModel.getUser(this.getOptionValue(userOptionName));
    this.reason = this.dataModel.getReason(this.getOptionValue(reasonOptionName));
    this.points = this.getOptionValue(pointsOptionName);
    this.comment = this.getOptionValue(commentOptionName);
  }

  async handleCommandInteraction(interaction) {
    if (this.points < this.reason.min || this.points > this.reason.max) {
      this.markAsDone();
      return interaction.createMessage(`Valid points range for the selected reason **${this.reason.name}** is ${this.reason.min} to ${this.reason.max}`);
    }
    const giver = this.dataModel.getUser(interaction.member.user.id);
    try {
      await this.dataModel.addScores([{
        user: this.user,
        giver,
        reason: this.reason,
        points: this.points,
        comment: this.comment,
      }]);
    } catch (error) {
      this.markAsDone();
      return interaction.createMessage(`Updating user ${this.user.name} score failed. Please check logs for more info.`);
    }
    return interaction.createMessage({
      content: `Added **${this.points}** points to user **${this.user.name}** with reason **${this.reason.name}**\nWould you like to send notification?`,
      components: [{
        type: ComponentTypes.ACTION_ROW,
        components: [{
          type: ComponentTypes.BUTTON,
          style: ButtonStyles.PRIMARY,
          custom_id: noButtonId,
          label: 'No',
        }, {
          type: ComponentTypes.BUTTON,
          style: ButtonStyles.PRIMARY,
          custom_id: sendDirectMessageButtonId,
          label: 'Send him a direct message',
        }, {
          type: ComponentTypes.BUTTON,
          style: ButtonStyles.PRIMARY,
          custom_id: createPublicMessageButtonId,
          label: `Create a public message`,
        }, {
          type: ComponentTypes.BUTTON,
          style: ButtonStyles.PRIMARY,
          custom_id: doBothButtonId,
          label: `Do both`,
        }],
      }],
    });
  }

  async sendDirectMessage(interaction) {
    const channel = await this.createDirectMessagesChannel(interaction.guildID, this.user.id);
    const giver = this.dataModel.getUser(interaction.member.user.id);
    await channel.createMessage(`${giver.name} added **${this.points}** points to you with reason ${this.reason.name}`);
    return `Direct message to **${this.user.name}** was sent.`;
  }

  async createPublicMessage(interaction) {
    const channel = await this.findPublicChannel(interaction.guildID);
    if (!channel) {
      console.error('Unable to send public message - public channel is missing');
      return;
    }
    await channel.createMessage(`**${this.user.name}** gained **${this.points}** points with reason ${this.reason.name}`);
    return `Public message at channel **${channel.name}** was created.`;
  }

  async handleComponentInteraction(interaction) {
    const content = await (() => {
      const buttonId = interaction.data.custom_id;
      switch (buttonId) {
        case noButtonId:
          return Promise.resolve('Done');
        case sendDirectMessageButtonId:
          return this.sendDirectMessage(interaction);
        case createPublicMessageButtonId:
          return this.createPublicMessage(interaction);
        case doBothButtonId:
          return Promise.all([
            this.sendDirectMessage(interaction),
            this.createPublicMessage(interaction),
          ]).then(status => status.join('\n'));
      }
    })();
    this.markAsDone();
    return interaction.createMessage(content);
  }
}

class AddPointsCommand extends Command {
  constructor() {
    super('add-points', 'Adds points to a user', ApplicationCommandTypes.CHAT_INPUT);
  }

  async initialize() {
    this.addOption(new UserOption(userOptionName, 'User name for which points points should be added', true));
    this.addOption(new ReasonOption(reasonOptionName, 'Reason why points are being added', true));
    this.addOption(new Option(pointsOptionName, 'Number of points to add', ApplicationCommandOptionTypes.NUMBER, true, false));
    this.addOption(new Option(commentOptionName, 'Comment', ApplicationCommandOptionTypes.STRING, false, false));
  }

  createInteractionHandler(client, dataModel, settings, optionsValues) {
    return new AddScoreInteractionHandler(client, dataModel, settings, optionsValues);
  }
}

module.exports = AddPointsCommand;
