const {Constants: {ApplicationCommandTypes, ComponentTypes, ButtonStyles}} = require('eris');
const UserOption = require('./UserOption');
const Command = require('./Command');
const InteractionHandler = require('./InteractionHandler');

const userOptionName = 'user';

class AddPointsInteractionHandler extends InteractionHandler {
  constructor(id, optionValues) {
    super(id, optionValues);
  }

  async handleCommandInteraction(interaction, dataModel) {
    const user = this.getOptionValue(userOptionName);
    // temporary form
    return interaction.createMessage({
      content: "Points have been added. Would you like to notify the user about this?" + user,
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

  async handleComponentInteraction(interaction, dataModel) {
    this.markAsDone();
    return interaction.createMessage('All done!');
  }
}

class AddPointsCommand extends Command {
  constructor() {
    super('addpoints', 'Adds points to a user', ApplicationCommandTypes.CHAT_INPUT, [
      new UserOption(userOptionName, 'User name for which points should be added', true, true),
    ]);
  }

  createInteractionHandler(id, optionValues) {
    return new AddPointsInteractionHandler(id, optionValues);
  }
}

module.exports = AddPointsCommand;
