const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class RecentlyGivenPointsOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, optionValue, translate) {
    const giverId = interaction.member.user.id;
    const userId = interaction.data.options.find(({name}) => name === OptionId.User)?.value;
    if (!userId) {
      return [];
    }
    const points = await dataModel.getRecentlyGivenPoints(userId, giverId, autoCompeteResultsLimit);
    const results = points
      .map(({id, points, acquireDate, reasonName}) => {
        const name = translate('autoCompete.recentlyGivenPoints', {
          points,
          acquireDate,
          reasonName,
        });
        return {
          name: formatAutoCompleteName(id, name),
          value: id,
        };
      });
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = RecentlyGivenPointsOption;
