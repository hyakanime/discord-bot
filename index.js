const fs = require('node:fs');
const path = require('node:path');
const { Partials,Client, Collection, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { token , channelBienvenue, roleMembre, rolePatchNotes, roleIos, roleAndroid, roleSite , roleBonPlan, roleGenshin, appKey, appSecret, accessToken, accessSecret, twitterid, twitterChannel} = require('./config.json');
const {phrases} = require('./bienvenue.json');
const cron = require("node-cron");
const { TwitterApi } = require("twitter-api-v2");

const client = new Client(    {
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildBans,
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

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

client.once(Events.ClientReady, () => {
	console.log('Ready!');
});

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'Il y a eu une erreur lors de l’exécution de cette commande !', ephemeral: true });
	}
});

//Bienvenue
client.on('guildMemberAdd',async (member) => {
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

})

// quoi -> feur
client.on('messageCreate', msg => {
    var message = msg.content ? msg.content.toUpperCase() : ""
    var arrayMessage = message.split(' ');
    var index = arrayMessage.indexOf("QUOI");
    // if quoi is present in phrasing
    if (index >= 0) {
        // if "quoi" ending phrasing
        if (arrayMessage.length - 1 === index) {
            var random = Math.floor(Math.random() * 3)
            if (random == 1) {
                if (msg.guild && msg.author) {
                    var id = msg.channel.id
                    var phrase = "feur"
                    client.channels.cache.get(id).send(phrase).then(async message => {
                        await message.react("🤣")
                        await message.react("👉")
                        await message.react("👈")
                    })
                }
            }
        }
    }
})

// ### EVENT CLIC BUTTON ###

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    let role = {};
    switch (interaction.customId) {
        case 'verifyButton':
            role = interaction.guild.roles.cache.find(role => role.id == roleMembre);
            if(interaction.member.roles.cache.find(r => r.id === roleMembre)){
                interaction.reply({ content: 'Le rôle <@&'+roleMembre+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleMembre+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-patchnote':
            role = interaction.guild.roles.cache.find(role => role.id == rolePatchNotes);
            if(interaction.member.roles.cache.find(r => r.id === rolePatchNotes)){
                interaction.reply({ content: 'Le rôle <@&'+rolePatchNotes+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+rolePatchNotes+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-ios':
            role = interaction.guild.roles.cache.find(role => role.id == roleIos);
            if(interaction.member.roles.cache.find(r => r.id === roleIos)){
                interaction.reply({ content: 'Le rôle <@&'+roleIos+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleIos+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-android':
            role = interaction.guild.roles.cache.find(role => role.id == roleAndroid);
            if(interaction.member.roles.cache.find(r => r.id === roleAndroid)){
                interaction.reply({ content: 'Le rôle <@&'+roleAndroid+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleAndroid+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-siteweb':
            role = interaction.guild.roles.cache.find(role => role.id == roleSite);
            if(interaction.member.roles.cache.find(r => r.id === roleSite)){
                interaction.reply({ content: 'Le rôle <@&'+roleSite+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleSite+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-bonplan':
            role = interaction.guild.roles.cache.find(role => role.id == roleBonPlan);
            if(interaction.member.roles.cache.find(r => r.id === roleBonPlan)){
                interaction.reply({ content: 'Le rôle <@&'+roleBonPlan+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleBonPlan+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        case 'role-genshin':
            role = interaction.guild.roles.cache.find(role => role.id == roleGenshin);
            if(interaction.member.roles.cache.find(r => r.id === roleGenshin)){
                interaction.reply({ content: 'Le rôle <@&'+roleGenshin+'> est bien retiré', ephemeral: true });
                await interaction.member.roles.remove(role);
            }
            else{
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&'+roleGenshin+'>', ephemeral: true });
            await interaction.member.roles.add(role);
            }
            break;
        default:
            interaction.reply({ content: 'Une erreur est survenue, contactez <@&245604480278593537>', ephemeral: true });
            break;
    }
});

//twitter

(async () => {
    const clienttwitter = new TwitterApi({
      appKey: appKey,
      appSecret: appSecret,
      accessToken: accessToken,
      accessSecret: accessSecret,
    });
    const userTimeline = await clienttwitter.v1.userTimeline(twitterid, {exclude_replies: true, include_rts: false, });
    const fetchedTweets = userTimeline.tweets;
    id_tweet = fetchedTweets[0].id;
    cron.schedule("*/15 * * * *", async () => {
      const userTimeline = await clienttwitter.v1.userTimeline(twitterid, {exclude_replies: true, include_rts: false,});
      const fetchedTweets = userTimeline.tweets;
      if (fetchedTweets[0].id != id_tweet) {
        const channel = client.channels.cache.get(twitterChannel);
        channel.send("https://twitter.com/Hyakanime/status/" + fetchedTweets[0].id_str);
        id_tweet = fetchedTweets[0].id;
      }
    });
  })();

client.on('error', console.error);
client.login(token);
