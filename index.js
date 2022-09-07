const {CommandClient} = require('eris');
const {discord: discordCredentials} = require('./credentials.js');
const InteractionManager = require('./src/InteractionManager');

const client = new CommandClient(discordCredentials.token);
const interactionManager = new InteractionManager(client);

async function onClientReady() {
  console.info('Client is ready');
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
