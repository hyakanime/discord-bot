const { Events, Client, GatewayIntentBits } = require("discord.js");
const {token} = require('../config.json');

const client = new Client({
    intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],}
  );
  client.login(token);
module.exports = {
  name: Events.MessageCreate,
  async execute(msg) {
    var message = msg.content ? msg.content.toUpperCase() : "";
    var arrayMessage = message.split(" ");
    var index = arrayMessage.indexOf("QUOI");
    // if quoi is present in phrasing
    if (index >= 0) {
      // if "quoi" ending phrasing
      if (arrayMessage.length - 1 === index) {
        var random = Math.floor(Math.random() * 3);
        if (random == 1) {
          if (msg.guild && msg.author) {
            var id = msg.channel.id;
            var phrase = "feur";
            client.channels.cache
              .get(id)
              .send(phrase)
              .then(async (message) => {
                await message.react("🤣");
                await message.react("👉");
                await message.react("👈");
              });
          }
        }
      }
    }
  },
};
