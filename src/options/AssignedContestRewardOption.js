const {Constants: {ApplicationCommandOptionTypes}} = require('eris');
const {formatEllipsis} = require('../Formatters');
const {contestRewardDescriptionLimit} = require('../constants');
const {OptionId} = require('./CommonOptions');
const {Option, SuggestionMethod} = require('./Option');

class AssignedContestRewardOption extends Option {
  constructor(id, description, required) {
    super(id, description, required, ApplicationCommandOptionTypes.INTEGER, SuggestionMethod.Autocomplete);
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    const contestId = interaction.data.options.find(({name}) => name === OptionId.Contest)?.value;
    if (!contestId) {
      return [];
    }
    const rewards = await dataModel.getAssignedContestRewards(contestId);
    const response = rewards.map(({id, description}) => ({
      name: formatEllipsis(description, contestRewardDescriptionLimit),
      value: id,
    }));
    return interaction.result(response);
  }
}

module.exports = AssignedContestRewardOption;
