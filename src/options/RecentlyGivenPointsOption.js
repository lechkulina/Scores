const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {OptionId} = require('./CommonOptions');
const Option = require('./Option');

class RecentlyGivenPointsOption extends Option {
  constructor(description, required) {
    super(OptionId.RecentlyGivenPoints, description, ApplicationCommandOptionTypes.NUMBER, required, true);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const giverId = interaction.member.user.id;
    const userId = interaction.data.options.find(({name}) => name === OptionId.User)?.value;
    if (!userId) {
      return [];
    }
    const points = await dataModel.getRecentlyGivenPoints(userId, giverId, 20);
    const response = points.map(({id, points, acquireDate, reasonName}) => ({
      name: translate('autoCompete.recentlyGivenPoints', {
        points,
        acquireDate,
        reasonName,
      }),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = RecentlyGivenPointsOption;
