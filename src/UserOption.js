const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');

class UserOption extends Option {
  constructor(name, description, required, autocomplete) {
    super(name, description, ApplicationCommandOptionTypes.NUMBER, required, autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel) {
    const users = await dataModel.getUsers();
    const response = users.map(user => ({
      name: user.discriminator,
      value: user.id,
    }));
    return interaction.result(response);
  }
}

module.exports = UserOption;
