const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatAutoCompleteName} = require('../Formatters');
const {autoCompeteResultsLimit} = require('../constants');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestAnnouncementOption extends Option {
  constructor(id, contestOptionId, description, dataModel) {
    super(id, description, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
    this.contestOptionId = contestOptionId;
    this.dataModel = dataModel;
  }

  async getAutoCompeteResults(interaction, optionValue, translate) {
    const contestId = this.findOptionValue(interaction, this.contestOptionId);
    if (!contestId) {
      return [];
    }
    const announcements = await this.dataModel.getAssignedContestAnnouncementsNames(contestId, autoCompeteResultsLimit);
    const results = announcements
      .map(({id, name}) => ({
        name: formatAutoCompleteName(id, name),
        value: id,
      }));
    return interaction.result(
      this.filterResults(results, optionValue)
    );
  }
}

module.exports = AssignedContestAnnouncementOption;
