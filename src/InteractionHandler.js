class InteractionHandler {
  constructor(id, optionsValues) {
    this.id = id;
    this.optionsValues = optionsValues;
    this.done = false;
  }

  getOptionValue(optionName) {
    return this.optionsValues.get(optionName);
  }

  getId() {
    return this.id;
  }

  isDone() {
    return this.done;
  }

  markAsDone() {
    this.done = true;
  }

  async handleCommandInteraction(interaction, dataModel) {
    throw new Error('handleCommandInteraction not implemented');
  }

  async handleComponentInteraction(interaction, dataModel) {
    throw new Error('handleComponentInteraction not implemented');
  }
}

module.exports = InteractionHandler;
