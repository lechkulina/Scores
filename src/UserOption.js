const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');

class UserOption extends Option {
  constructor(name, description, required) {
    super(name, description, ApplicationCommandOptionTypes.STRING, required, true);
  }

  async getAutoCompeteResults(autocompleteInteraction, dataModel, value) {
    const users = await dataModel.searchUsers(autocompleteInteraction.guildID, value, 20);
    const response = users.map(({name, discriminator, id}) => ({
      name: `${name}#${discriminator}`,
      value: id,
    }));
    return autocompleteInteraction.result(response);
  }
}

module.exports = UserOption;
