class Command {
  constructor(name, description, type, options = []) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.options = new Map();
    options.forEach(option => {
      this.options.set(option.name, option);
    });
  }

  getConfig() {
    const options = Array.from(this.options.keys()).map(key =>
      this.options.get(key).getConfig()
    );
    return {
      name: this.name,
      description: this.description,
      type: this.type,
      options,
    };
  }

  addOption(option) {
    this.options.set(option.name, option);
  }

  findOption(optionName) {
    return this.options.get(optionName);
  }

  createOptionsValues(interaction) {
    const optionsValues = new Map();
    interaction.data.options.forEach(({name, value}) => {
      const option = this.findOption(name);
      optionsValues.set(name, option.processValue(value));
    });
    return optionsValues;
  }

  createInteractionHandler(id, optionsValues) {
    throw new Error('createInteractionHandler not implemented');
  }
};

module.exports = Command;
  