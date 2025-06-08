const { Events, GatewayIntentBits } = require("discord.js");

module.exports = {
  name: Events.MessageCreate,
  async execute(msg) {
    let message = msg.content ? msg.content.toLowerCase() : "";
    message = message.replace(/[^a-zA-Z0-9 ]/g, "").replace(" ", "");
    if (message.slice(-4).includes("quoi")) {
        if( Math.floor(Math.random() * 5) == 0 ) {
            msg.reply({content: "feur", allowedMentions: { repliedUser: false }}).then((m) => {
                m.react("🤣");
                m.react("👉");
                m.react("👈");
            })
        }
    }
  }}