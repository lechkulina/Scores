const moment = require('moment');
const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {autoCompeteResultsLimit} = require('../constants');
const {formatAutoCompleteName} = require('../Formatters');
const {SettingId} = require('../Settings');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class RecentlyGivenPointsOption extends Option {
  constructor(id, optionUserId, description, dataModel, settings) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.optionUserId = optionUserId;
    this.dataModel = dataModel;
    this.settings = settings;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const guildId = interaction.guildID;
    const giverId = interaction.member.user.id;
    const userId = interaction.data.options.find(({name}) => name === this.optionUserId)?.value;
    if (!userId) {
      return [];
    }
    const dateAndTimeOutputFormat = this.settings.get(SettingId.DateAndTimeOutputFormat);
    const points = await this.dataModel.getUserRecentlyGivenPointsOptions(guildId, userId, giverId, autoCompeteResultsLimit);
    const results = points
      .map(({id, points, acquireDate, categoryName}) => {
        const name = translate('autoCompete.recentlyGivenPoints', {
          points,
          acquireDate: moment(acquireDate).format(dateAndTimeOutputFormat),
          categoryName,
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
