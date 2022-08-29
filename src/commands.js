const CommandsCollection = require('./CommandsCollection');
const AddPointsCommand = require('./AddPointsCommand');

/**
 * Collection of all supported commands
 */
const commands = new CommandsCollection([
  new AddPointsCommand(),
]);

module.exports = commands;
