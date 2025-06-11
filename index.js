const fs = require('node:fs');
const path = require('node:path');
const { Partials, Client, Collection, GatewayIntentBits} = require('discord.js');
const { token, channelEdit } = require('./config.json');
const cron = require("node-cron");
const { embedEdit } = require("./function/edit.js");

const client = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Channel],
}
);

client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));


for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.login(token);

client.on('ready', () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
  // appel de la function toutes les heures
  cron.schedule('0 * * * *', () => { 
    embedEdit(client, channelEdit);
  });
});