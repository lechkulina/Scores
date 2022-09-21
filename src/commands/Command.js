const {Constants: {ApplicationCommandTypes}} = require('eris');

class Command {
  constructor(id, clientHandler, dataModel, settings, translate) {
    this.id = id;
    this.clientHandler = clientHandler;
    this.dataModel = dataModel;
    this.settings = settings;
    this.translate = translate;
    this.description = '';
    this.options = new Map();
    this.validators = [];
  }

  getConfig() {
    const options = Array.from(this.options.keys()).map(key =>
      this.options.get(key).getConfig()
    );
    return {
      name: this.id,
      description: this.description,
      type: ApplicationCommandTypes.CHAT_INPUT,
      options,
    };
  }

  setDescription(description) {
    this.description = description;
  }

  addOptions(options) {
    options.forEach(option => this.options.set(option.id, option));
  }

  addValidators(validators) {
    this.validators.push(...validators);
  }

  findOption(id) {
    return this.options.get(id);
  }

  initialize() {
    return Promise.resolve();
  }

  createOptionsValues(interaction) {
    const optionsValues = new Map();
    (interaction.data.options ?? []).forEach(({name, value}) => {
      if (this.findOption(name)) {
        optionsValues.set(name, value);
      }
    });
    return optionsValues;
  }

  async validateOptionsValues(translate, optionsValues, interaction) {
    const issues = [];
    for (const validator of this.validators) {
      issues.push(
        ...(await validator.validate(translate, optionsValues, interaction))
      );
    }
    return issues;
  }

  createInteractionHandler(clientHandler, dataModel, settings, translate, optionsValues) {
    return Promise.resolve();
  }
};

module.exports = Command;
  