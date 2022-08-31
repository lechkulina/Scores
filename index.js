const {CommandClient} = require('eris');
const {discord: discordCredentials} = require('./credentials.js');
const DataModel = require('./src/DataModel');
const InteractionManager = require('./src/InteractionManager');

const client = new CommandClient(discordCredentials.token);
const dataModel = new DataModel(client);
const interactionManager = new InteractionManager(client, dataModel);

async function onClientReady() {
  console.info('Client is ready');
  await dataModel.initialize();
  await interactionManager.initialize();
  console.info('Bot is ready');
};

function onClientError(error) {
  console.error('Client error: ' + error);
};

function onInteractionCreate(interaction) {
  return interactionManager.handleInteraction(interaction);
}

client.on('ready', onClientReady);
client.on('error', onClientError);
client.on("interactionCreate", onInteractionCreate);

client.connect();
