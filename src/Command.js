class Command {
  constructor(translate, name, type) {
    this.translate = translate;
    this.name = name;
    this.type = type;
    this.description = '';
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

  setDescription(description) {
    this.description = description;
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

  initialize() {
    throw new Error('initialize not implemented');
  }

  createInteractionHandler(client, dataModel, settings, translate, optionsValues) {
    throw new Error('createInteractionHandler not implemented');
  }
};

module.exports = Command;
  