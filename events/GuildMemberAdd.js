const { Events, EmbedBuilder, Client, GatewayIntentBits } = require('discord.js');
const {token, channelBienvenue} = require('../config.json');
const {phrases} = require('../bienvenue.json');
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
	name: Events.GuildMemberAdd,
	async execute(member) {
	let Pseudo = member.user.id;
    let number = Math.floor(Math.random() * Math.floor(phrases.length));

    var avatar = member.user.avatarURL()
    const embedBienvenue = new EmbedBuilder()
        .setTitle("Nouveau membre !")
        .setDescription(phrases[number].replace("*", "<@"+Pseudo+">"))
        .setThumbnail(avatar)
        .setFooter({text:'Hyakanime', iconUrl: avatar})
        .setColor('#35B0FF')

    const channel = client.channels.cache.get(channelBienvenue);
    channel.send({embeds: [embedBienvenue] });
	},
};
