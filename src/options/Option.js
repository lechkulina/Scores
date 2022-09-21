const {Constants: {ApplicationCommandOptionTypes}} = require('eris');

const SuggestionMethod = {
  None: 0,
  Autocomplete: 1,
  Choices: 2
};

class Option {
  constructor(id, description, required = true, type = ApplicationCommandOptionTypes.NUMBER, suggestionMethod = SuggestionMethod.None) {
    this.id = id;
    this.description = description;
    this.type = type;
    this.required = required;
    this.suggestionMethod = suggestionMethod;
  }

  getConfig() {
    return {
      name: this.id,
      description: this.description,
      type: this.type,
      required: this.required,
      autocomplete: this.suggestionMethod === SuggestionMethod.Autocomplete,
      choices: this.suggestionMethod === SuggestionMethod.Choices ? this.getChoices() : undefined,
    };
  }

  getChoices() {
    return [];
  }

  filterResults(results, optionValue) {
    const referenceName = optionValue.toLowerCase();
    return results.filter(result => {
      const name = result.name.toLowerCase();
      return name.startsWith(referenceName);
    });
  }

  async getAutoCompeteResults(interaction, dataModel, optionValue, translate) {
    return interaction.result([]);
  }
};

module.exports = {
  SuggestionMethod,
  Option,
};
