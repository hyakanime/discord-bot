const fs = require('node:fs');
const path = require('node:path');
const { Partials, Client, Collection, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token, channelEdit } = require('./config.json');
const cron = require("node-cron");
const fetch = require("node-fetch");

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

//Alerte Edits
var alerte = 0; // 0 = Ok - 1 = Avertissement - 2 = Stop - 3 = Alerte

cron.schedule("0 */6 * * *", async () => {
  let responseAdminStats = await fetch("https://api.hyakanime.fr/admin/stats");
  let dataAdminStats = await responseAdminStats.text();
  var resultatAdminStats = JSON.parse(dataAdminStats);

  const embedAvertissementEdit = new EmbedBuilder()
    .setAuthor({ name: "⚠️ Avertissement Edits" })
    .setColor("#ff6700")
    .setDescription(
      `**Actuellement il y a ${resultatAdminStats.editAnime} édits en cours ! \n\n Merci de réduire le nombre d'édition le temps que les précédentes soient traités.**` //25
    )
    .setTimestamp();

  const embedStopEdit = new EmbedBuilder()
    .setAuthor({ name: "⚠️ Avertissement Edits" })
    .setColor("#FF0000")
    .setDescription(
      `**Actuellement il y a ${resultatAdminStats.editAnime} édits en cours ! \n\n Merci d'arrêter d'envoyer de nouveaux édits sauf s'ils continnent de nouvelles informations importantes.**` //50
    )
    .setTimestamp();

  const embedCaFaitBeaucoupLa = new EmbedBuilder()
    .setAuthor({ name: "⚠️ Avertissement Edits" })
    .setColor("#8B0000")
    .setDescription(
      `**Actuellement il y a ${resultatAdminStats.editAnime} édits en cours ! \n\n Nous y apprenons également le décès de <@266172334010925056> suite à un surmenage 🪦.**` //100
    )
    .setTimestamp();

  const embedEditBon = new EmbedBuilder()
    .setAuthor({ name: "⚠️ Avertissement Edits" })
    .setColor("#00FF00")
    .setDescription(
      "**Vous pouvez reprendre vos édits à un rythme normal ! \n\n Merci de votre compréhension !**"
    )
    .setTimestamp();

  const channel = client.channels.cache.get(channelEdit);

  if (resultatAdminStats.editAnime >= 25) {
    switch (true) {
      case resultatAdminStats.editAnime >= 100:
        if (alerte != 3) {
          channel.send({ embeds: [embedCaFaitBeaucoupLa] });
        }
        alerte = 3;
        break;
      case resultatAdminStats.editAnime >= 50:
        if (alerte != 2) {
          channel.send({ embeds: [embedStopEdit] });
        }
        alerte = 2;
        break;
      case resultatAdminStats.editAnime >= 25:
        if (alerte != 1) {
          channel.send({ embeds: [embedAvertissementEdit] });
        }
        alerte = 1;
        break;
      default:
    }
  }

  if (alerte >= 1 && resultatAdminStats.editAnime <= 10) {
    channel.send({ embeds: [embedEditBon] });
    alerte = 0;
  }
});
