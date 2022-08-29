const {CommandClient} = require('eris');
const {discord: discordCredentials} = require('./credentials.js');
const DataModel = require('./src/DataModel');
const InteractionHandlersManager = require('./src/InteractionHandlersManager');


const client = new CommandClient(discordCredentials.token);
const dataModel = new DataModel(client);
const interactionHandlersManager = new InteractionHandlersManager(client, dataModel);

async function onClientReady() {
  console.info('Client is ready');
  await interactionHandlersManager.registerCommands();
  console.info('Commands are regiestered');
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

async function init() {
  console.info('initializing data model');
  await dataModel.initialize();
  console.info('Connecting...');
  await client.connect();
  console.info('Connected');
}

init();