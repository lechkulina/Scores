const {CommandClient} = require('eris');
const {discord: discordCredentials} = require('./credentials.js');
const DataModel = require('./src/DataModel');
const InteractionHandlersManager = require('./src/InteractionHandlersManager');

const client = new CommandClient(discordCredentials.token);
const dataModel = new DataModel(client);
const interactionHandlersManager = new InteractionHandlersManager(client, dataModel);

async function onClientReady() {
  console.info('Client is ready');
  await dataModel.initialize();
  await interactionHandlersManager.initialize();
  console.info('Bot is ready');
};

function onClientError(error) {
  console.error('Client error: ' + error);
};

function onInteractionCreate(interaction) {
  return interactionHandlersManager.handleInteraction(interaction);
}

client.on('ready', onClientReady);
client.on('error', onClientError);
client.on("interactionCreate", onInteractionCreate);

client.connect();
