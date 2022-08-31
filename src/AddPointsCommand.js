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

class AddScoreInteractionHandler extends InteractionHandler {
  constructor(optionValues) {
    super(optionValues);
  }

  async handleCommandInteraction(commandInteraction, dataModel) {
    const user = dataModel.getUser(this.getOptionValue(userOptionName));
    const giver = dataModel.getUser(commandInteraction.member.user.id);
    const reason = dataModel.getReason(this.getOptionValue(reasonOptionName));
    const points = this.getOptionValue(pointsOptionName);
    const comment = this.getOptionValue(commentOptionName);
    await dataModel.addScores([{
      user,
      giver,
      reason,
      points,
      comment
    }]);
    // temporary form
    return commandInteraction.createMessage({
      // content: "Points have been added. Would you like to notify the user about this?",
      content: `You have added ${points} points to user ${user.name}#${user.discriminator} for ${reason.name}`,
      components: [
          {
              type: ComponentTypes.ACTION_ROW,
              components: [
                  {
                      type: ComponentTypes.BUTTON,
                      style: ButtonStyles.PRIMARY,
                      custom_id: "send_dm",
                      label: "Send him DM",
                      disabled: false,
                  },
                  {
                    type: ComponentTypes.BUTTON,
                    style: ButtonStyles.PRIMARY,
                    custom_id: "share",
                    label: "Share public post",
                    disabled: false,
                },
              ]
          }
      ]
    })
  }

  async handleComponentInteraction(componentInteraction, dataModel) {
    this.markAsDone();
    return componentInteraction.createMessage('All done!');
  }
}

class AddPointsCommand extends Command {
  constructor() {
    super('add-points', 'Adds points to a user', ApplicationCommandTypes.CHAT_INPUT);
  }

  async initialize(dataModel) {
    this.addOption(new UserOption(userOptionName, 'User name for which points points should be added', true));
    this.addOption(new ReasonOption(reasonOptionName, 'Reason why points are being added', true));
    this.addOption(new Option(pointsOptionName, 'Number of points to add', ApplicationCommandOptionTypes.NUMBER, true, false));
    this.addOption(new Option(commentOptionName, 'Comment', ApplicationCommandOptionTypes.STRING, false, false));
  }

  createInteractionHandler(optionValues) {
    return new AddScoreInteractionHandler(optionValues);
  }
}

module.exports = AddPointsCommand;
