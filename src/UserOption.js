const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const Option = require('./Option');
const {OptionId} = require('./Options');

class UserOption extends Option {
  constructor(description, required) {
    super(OptionId.User, description, ApplicationCommandOptionTypes.STRING, required, true);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const users = await dataModel.searchUsers(interaction.guildID, optionValue, 20);
    const response = users.map(({name, discriminator, id}) => ({
      name: `${name}#${discriminator}`,
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = UserOption;
