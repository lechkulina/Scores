const moment = require('moment');
const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class RecentlyGivenPointsOption extends Option {
  constructor(id, description, dataModel, settings) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.dataModel = dataModel;
    this.settings = settings;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const giverId = interaction.member.user.id;
    const userId = interaction.data.options.find(({name}) => name === OptionId.User)?.value;
    if (!userId) {
      return [];
    }
    const dateAndTimeOutputFormat = await this.settings.get('dateAndTimeOutputFormat');
    const points = await this.dataModel.getRecentlyGivenPoints(userId, giverId, autoCompeteResultsLimit);
    const results = points
      .map(({id, points, acquireDate, reasonName}) => {
        const name = translate('autoCompete.recentlyGivenPoints', {
          points,
          acquireDate: moment(acquireDate).format(dateAndTimeOutputFormat),
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
