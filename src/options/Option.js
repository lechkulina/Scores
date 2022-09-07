class Option {
  constructor(id, description, type, required = true, autocomplete = false) {
    this.id = id;
    this.description = description;
    this.type = type;
    this.required = required;
    this.autocomplete = autocomplete;
  }

  getConfig() {
    return {
      name: this.id,
      description: this.description,
      type: this.type,
      required: this.required,
      autocomplete: this.autocomplete,
    };
  }

  async getAutoCompeteResults(interaction, dataModel, translate, optionValue) {
    return interaction.result([]);
  }
};

module.exports = Option;
