const {Constants: {ApplicationCommandOptionTypes}} = require('eris');

const SuggestionMethod = {
  None: 0,
  Autocomplete: 1,
  Choices: 2
};

class Option {
  constructor(id, description, type, suggestionMethod = SuggestionMethod.None, required = true) {
    this.id = id;
    this.description = description;
    this.type = type;
    this.suggestionMethod = suggestionMethod;
    this.required = required;
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

  async getAutoCompeteResults(interaction, optionValue, translate) {
    return interaction.result([]);
  }
};

module.exports = {
  SuggestionMethod,
  Option,
};
