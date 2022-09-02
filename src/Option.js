class Option {
  constructor(name, description, type, required, autocomplete) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.required = required;
    this.autocomplete = autocomplete;
  }

  getConfig() {
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      required: this.required,
      autocomplete: this.autocomplete,
    };
  }

  processValue(value) {
    return value; // some options may want to process the value in some way
  }

  async getAutoCompeteResults(interaction, dataModel, value) {
    return interaction.result([]);
  }
};

module.exports = Option;
