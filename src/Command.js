class Command {
  constructor(name, description, type) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.options = new Map();
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

  setName(name) {
    this.name = name;
  }

  setDescription(description) {
    this.description = description;
  }

  setType(type) {
    this.type = type;
  }

  addOption(option) {
    this.options.set(option.name, option);
  }

  findOption(optionName) {
    return this.options.get(optionName);
  }

  createOptionsValues(commandInteraction) {
    const optionsValues = new Map();
    commandInteraction.data.options.forEach(({name, value}) => {
      const option = this.findOption(name);
      optionsValues.set(name, option.processValue(value));
    });
    return optionsValues;
  }

  initialize(dataModel) {
    throw new Error('initialize not implemented');
  }

  createInteractionHandler(optionsValues) {
    throw new Error('createInteractionHandler not implemented');
  }
};

module.exports = Command;
  