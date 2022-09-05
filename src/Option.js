class Option {
  constructor(name, description, type, required = true, autocomplete = false) {
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

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    return interaction.result([]);
  }
};

module.exports = Option;
