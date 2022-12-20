const { Partials, Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder, } = require('discord.js');
const { token , roleBeta, channelBeta, channelBienvenue, roleMembre, rolePatchNotes, roleIos, roleAndroid, roleSite , roleBonPlan, roleGenshin, appKey, appSecret, accessToken, accessSecret, twitterid, twitterChannel} = require('./config.json');
const {phrases} = require('./bienvenue.json');
const fetch = require("node-fetch");
const { TwitterApi } = require("twitter-api-v2");
const cron = require("node-cron");
const client = new Client(
    {
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


client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


// Reply to all interaction create
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;


    switch (interaction.commandName) {
        case 'pageblanche':

            const embed = new EmbedBuilder()
                .setAuthor({ name: "📄 Page Blanche" })
                .setColor('#196ffa')
                .setDescription('Les pages blanches sur le site peuvent apparaître à la suite de nombreuses causes :')
                .addFields(
                    { name: '• Bloqueur de publicité (AdBlock)', value: `Désactivez votre bloqueur de publicité (et soutenez Hyakanime).`, inline: false },
                    { name: '• Cache du site internet', value: "Pour actualiser le cache du site, rendez-vous sur https://hyakanime.fr et appuyez simultanément sur `CTRL + F5`", inline: false },
                    { name: '\u200b', value: "Si le souci persiste, n'hésitez pas à mentionner <@245604480278593537>", inline: false },

                )
                .setTimestamp()
            await interaction.reply({ embeds: [embed] });

            break;


        case 'embed':

            const embed2 = new EmbedBuilder()
                .setAuthor({ name: "🖼️ Embed (image sur les liens)" })
                .setColor('#196ffa')
                .setDescription('Les images présentes dans les embeds de liens sont générés sur serveur dès le partage du lien en question. Suivant où le lien est partagé (Twitter, Discord..), l\'image peut-être mise en cache et ne peut donc s\'actualiser durant plusieurs heures ou plusieurs jours.')
                .setTimestamp()
            await interaction.reply({ embeds: [embed2] });

            break;


        case 'down':

            const embed3 = new EmbedBuilder()
                .setAuthor({ name: "📵 Le serveur Hyakanime est down" })
                .setColor('#196ffa')
                .setDescription('Tout ou une partie des services Hyakanime ne sont pas accessibles momentanément. \nPour suivre l\'évolution : https://hyakanime.checklyhq.com/ ')
                .setTimestamp()
            await interaction.reply({ embeds: [embed3] });

            break;


        case 'avisdesastreux':
            const file = new AttachmentBuilder('https://i.imgur.com/NzAL3dG.mp4');
            const embed4 = new EmbedBuilder()
                .setAuthor({ name: "🚨 ALERTE AVIS DÉSASTREUX 🚨" })
                .setColor('#fa2525')
            await interaction.reply({ files: [file], embeds: [embed4] });

            break;



        // AFFILIATION 


        case 'fnac':

            var url = interaction.options.get("lien").value;
            if (url.indexOf('http') >= 0 && url.indexOf('.') >= 0) {

                var urlFinal = ""
                var index = url.indexOf("#");
                if (index === -1) {
                    urlFinal = "https://www.awin1.com/cread.php?awinmid=12665&awinaffid=1068391&ued=" + url
                }
                else {
                    urlFinal = "https://www.awin1.com/cread.php?awinmid=12665&awinaffid=1068391&ued=" + url.substr(0, index);
                }

                await interaction.reply({ content: "Voici le lien affilié \n" + urlFinal + "\nMerci de soutenir Hyakanime 💙", ephemeral: true });
            }
            else {
                interaction.reply({ content: "Format d'url invalide", ephemeral: true })
            }
            break;


        case 'amazon':

            var url = interaction.options.get("lien").value;
            if (url.indexOf('http') >= 0 && url.indexOf('.') >= 0) {

                var urlFinal = ""
                var index = url.indexOf("tag");
                if (url.indexOf("tag")!= -1)
                {
                    url = url.substr(0, index)
                }
                var pays = url.substr(url.indexOf('amazon')+7,2);
                switch (pays){
                    case 'fr':
                        urlFinal = url + "&tag=hyakanime03-21";
                        break;
                    case 'it':
                        urlFinal = url + "&tag=hyakanime0b-21";
                        break;
                    case 'es':
                        urlFinal = url + "&tag=hyakanime05-21";
                        break;
                    case 'de':
                        urlFinal = url + "&tag=hyakanime07-21";
                        break;
                    case 'uk':
                        urlFinal = url + "&tag=hyakanime095-21";
                        break;
                    default :
                        urlFinal = url + "&tag=hyakanime03-21";
                    }

                await interaction.reply({ content: "Voici le lien affilié \n" + urlFinal + "\nMerci de soutenir Hyakanime 💙", ephemeral: true });

            }
            else {
                interaction.reply({ content: "Format d'url invalide", ephemeral: true })
            }

            break;


        case 'beta':

            var email = interaction.options.get("email").value;
            var system = interaction.options.get("système").value;
            if (/^[a-zA-Z0-9_.]+@[a-zA-Z0-9]+\.[a-zA-Z]{1,3}$/.test(email)) {

                role = interaction.guild.roles.cache.find(role => role.id == roleBeta);
                await interaction.member.roles.add(role);

                const embedBeta = new EmbedBuilder()
                    .setAuthor({ name: "Vous êtes maintenant inscrit pour tester les version bêta de Hyakanime !" })
                    .addFields(
                        { name: '\u200b', value: "Vous venez de recevoir le rôle <@&1036572391201054730>.", inline: false },
                        { name: '\u200b', value: "Rappel : En participant aux tests de l\'application, vous accepter de rencontrer des bugs et de les faire remonter.", inline: false },
                    )
                    .setColor('#3d67ff')


                const embedbetaAdmin = new EmbedBuilder()
                    .setAuthor({ name: `Inscription de <@${interaction.member.id}>` })
                    .addFields(
                        { name: 'Plateforme', value: system, inline: false },
                        { name: 'email', value: email, inline: false },
                    )
                    .setColor('#3d67ff')
                client.channels.cache.get(channelBeta).send({ content: '', embeds: [embedbetaAdmin] })

                await interaction.reply({ content: '', embeds: [embedBeta], ephemeral: true });

            }
            else {
                interaction.reply({ content: "Format de l'email invalide", ephemeral: true })
            }

            break;
        case 'agenda':

            await interaction.deferReply();
            let date = new Date();
            if (date.getTimezoneOffset() == 0)
            {
               var changementTimestamp = 3600000;
               var changementHeure = 1;
            }
            else
            {
                var changementTimestamp = 0;
                var changementHeure = 0;
            }
            date.setHours(0, 0, 0, 0);
            timestampAjrd = Date.parse(date)-changementTimestamp;
            date.setDate(date.getDate() + 1);
            timestampDemain = Date.parse(date)-changementTimestamp;
            let headersList = {
              Accept: "*/*",
              "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            };
            let response = await fetch(
              "https://api.hyakanime.fr/episode/sortie-hebdo/" +
                timestampAjrd +
                "/" +
                timestampDemain,
              {
                method: "GET",
                headers: headersList,
              }
            );
        
            let data = await response.text();
            var result = JSON.parse(data);
            var i = 0;
            var b = 0;
            var nom = [];
            var episode = [];
            var timestamp = [];
            while (i < result.length) {
              if (result[i].displayCalendar == true) {
                nom[b] = result[i].animeTitle;
                episode[b] = result[i].title;
                const heure = new Date(result[i].timestamp);
                
                if (heure.getMinutes() == 0) {
                  timestamp[b] = heure.getHours()+changementHeure + "h00" ;
                } else {
                  timestamp[b] = heure.getHours()+changementHeure + "h" + heure.getMinutes();
                }
                b++;
              }
              i++;
            }
            i = 0;
            const exampleEmbed = new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle("Agenda du Jour")
              .setURL("https://hyakanime.fr/agenda")
              .setAuthor({
                name: "hyakanime",
                iconURL:
                  "https://www.hyakanime.fr/static/media/appLogo.7fac0ec4359bda8ccf0f.png",
                url: "https://hyakanime.fr",
              })
              .setTimestamp();
              i=0
              while (i < nom.length) {
                exampleEmbed.addFields({name: timestamp[i], value: nom[i].slice(0, 43)+" - "+episode[i], inline: false})
              i++;
              }
                
              
            await interaction.editReply({ embeds: [exampleEmbed] });
            break;

        case 'user':
            await interaction.deferReply();
            const pseudo = interaction.options.getString("pseudo");
        
            let responseUser = await fetch("https://api.hyakanime.fr/user/profile-information/" + pseudo);
            let dataUser = await responseUser.text();
            var result = JSON.parse(dataUser);
            var timestamp = result.createdAt;
            let date1 = new Date(timestamp * 1);
            let response2 = await fetch("https://api.hyakanime.fr/progress/read/" + pseudo);
            let data2 = await response2.text();
            var resultatProgression = JSON.parse(data2);
            var premium = "";
            var episodes = resultatProgression.length;
            var addition = 0;
            var i = 0;
            var revisionageEpisode = 0;
            var mois = date1.getMonth() + 1;
            while (i < episodes) {
              addition += resultatProgression[i].progression;
              if (resultatProgression[i].rewatch != undefined) {
                revisionageEpisode = revisionageEpisode + resultatProgression[i].rewatch * resultatProgression[i].progression;
              }
              i++;
            }
            if (result.isPremium == true) {
              premium = "★";
            }
            if (result.biographie[0] == undefined) {
              result.biographie = pseudo + " n'a pas de biographie";
            }
            if (result.username != undefined) {
              const userEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle(result.username + " " + premium)
                .setURL("https://hyakanime.fr/profile/" + pseudo)
                .setAuthor({
                  name: "Hyakanime",
                  iconURL:
                    "https://www.hyakanime.fr/static/media/appLogo.7fac0ec4359bda8ccf0f.png",
                  url: "https://hyakanime.fr",
                })
                .setDescription(result.biographie)
                .setThumbnail(result.photoURL)
                .addFields(
                  { name: "TITRE AJOUTÉS", value: "" + episodes, inline: true },
                  { name: "\u200b", value: "\u200b",inline: true },
                  { name: "ÉPISODES VUS", value: "" + addition, inline: true },
                { name: "TITRE REWATCH", value: "" + revisionageEpisode,inline: true },
                { name: "\u200b", value: "\u200b",inline: true },
                { name: "ÉPISODES REWATCH", value: "" + revisionageEpisode, inline: true}
                )
                .setTimestamp()
                .setFooter({
                  text:
                    "Compte créer le " +
                    date1.getDate() +
                    "/" +
                    mois +
                    "/" +
                    date1.getFullYear(),
                });
        
              await interaction.editReply({ embeds: [userEmbed] });
            } else {
              await interaction.editReply({
                content:
                  "Le pseudo n'est pas correct, veuillez vérifier si vous l'avez bien écrit et bien mis les majs",
                ephemeral: true,
              });
            }
          
        
        break;
    }


});


// message a l'arrivée d'un membre
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


client.login(token);
