const {Constants: {ApplicationCommandTypes}} = require('eris');

class Command {
  constructor(translate, name, type = ApplicationCommandTypes.CHAT_INPUT) {
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

  createOptionsValues(interaction) {
    const optionsValues = new Map();
    (interaction.data.options ?? []).forEach(({name, value}) => {
      const option = this.findOption(name);
      optionsValues.set(name, option.processValue(value));
    });
    return optionsValues;
  }

  initialize() {
    return Promise.resolve();
  }

  createInteractionHandler(client, dataModel, settings, translate, optionsValues) {
    return Promise.resolve();
  }
};

module.exports = Command;
  