const { Partials, Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
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

            const embed4 = new EmbedBuilder()
                .setAuthor({ name: "🚨 ALERTE AVIS DÉSASTREUX 🚨" })
                .setColor('#fa2525')
            await interaction.reply({ content: "https://i.imgur.com/NzAL3dG.mp4", embeds: [embed4] });

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
                if (index === -1) {
                    if (url.indexOf('amazon.fr')) {
                        urlFinal = url + "&tag=hyakanime03-21";
                    }
                    else if (url.indexOf('amazon.it')) {
                        urlFinal = url + "&tag=hyakanime0b-21";
                    }
                    else if (url.indexOf('amazon.es')) {
                        urlFinal = url + "&tag=hyakanime05-21";
                    }
                    else if (url.indexOf('amazon.de')) {
                        urlFinal = url + "&tag=hyakanime07-21";
                    }
                    else if (url.indexOf('amazon.uk')) {
                        urlFinal = url + "&tag=hyakanime095-21";
                    }
                    else {
                        urlFinal = url + "&tag=hyakanime03-21";
                    }
                }
                else {
                    if (url.indexOf('amazon.fr')) {
                        urlFinal = url.substr(0, index) + "&tag=hyakanime03-21";
                    }
                    else if (url.indexOf('amazon.it')) {
                        urlFinal = url.substr(0, index) + "&tag=hyakanime0b-21";
                    }
                    else if (url.indexOf('amazon.es')) {
                        urlFinal = url.substr(0, index) + "&tag=hyakanime05-21";
                    }
                    else if (url.indexOf('amazon.de')) {
                        urlFinal = url.substr(0, index) + "&tag=hyakanime07-21";
                    }
                    else if (url.indexOf('amazon.uk')) {
                        urlFinal = url.substr(0, index) + "&tag=hyakanime095-21";
                    }
                    else {
                        urlFinal = url.substr(0, index) + "&tag=hyakanime03-21";
                    }
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
            let headersListUser = {
              Accept: "*/*",
              "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            };
        
            let responseUser = await fetch(
              "https://api.hyakanime.fr/user/profile-information/" + pseudo,
              {
                method: "GET",
                headers: headersList,
              }
            );
            let dataUser = await responseUser.text();
            var result = JSON.parse(dataUser);
            var timestamp = result.createdAt;
            let date1 = new Date(timestamp * 1);
            let headersList2 = {
              Accept: "*/*",
              "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            };
        
            let response2 = await fetch(
              "https://api.hyakanime.fr/progress/read/" + pseudo,
              {
                method: "GET",
                headers: headersList2,
              }
            );
        
            let data2 = await response2.text();
            var result2 = JSON.parse(data2);
            var premium = "";
            var episodes = result2.length;
            var addition = 0;
            var i = 0;
            var revisionage = 0;
            var mois = date1.getMonth() + 1;
            while (i < episodes) {
              addition += result2[i].progression;
              if (result2[i].rewatch != undefined) {
                revisionage = revisionage + result2[i].rewatch * result2[i].progression;
              }
              i++;
            }
            if (result.isPremium == true) {
              premium = "★";
            }
            var couleur;
            switch (result.themeColor) {
              case 1:
                couleur = 0x0080d1;
                break;
              case 2:
                couleur = 0xffceb1;
                break;
              case 3:
                couleur = 0xffed92;
                break;
              case 4:
                couleur = 0xff93c5;
                break;
              case 5:
                couleur = 0xfc897e;
                break;
              case 6:
                couleur = 0xff82a8;
                break;
              case 7:
                couleur = 0x79e3a4;
                break;
              case 8:
                couleur = 0x344556;
                break;
              case 9:
                couleur = 0x79d0f2;
                break;
              case 10:
                couleur = 0xff58e4;
                break;
              case 11:
                couleur = 0x9794f2;
                break;
              case 12:
                couleur = 0x58ffb9;
                break;
              case 13:
                couleur = 0xfe8189;
                break;
              case 14:
                couleur = 0xf7ce4b;
                break;
              case 15:
                couleur = 0xadd4f6;
                break;
              case 16:
                couleur = 0xf2b3d6;
                break;
              case 17:
                couleur = 0xffa8a8;
                break;
              case 18:
                couleur = 0x1d8ff2;
                break;
              case 19:
                couleur = 0xff5fac;
                break;
              case 20:
                couleur = 0x15e3e3;
                break;
              case 21:
                couleur = 0x91b9fe;
                break;
              case 22:
                couleur = 0xc1e5ff;
                break;
              case 23:
                couleur = 0xf0a3ff;
                break;
              case 24:
                couleur = 0x294abf;
                break;
              case 25:
                couleur = 0x3164bf;
                break;
              case 25:
                couleur = 0x6e8ffb;
                break;
              case 26:
                couleur = 0x8171d1;
                break;
              default:
                couleur = 0x0080d1;
            }
            if (result.biographie[0] == undefined) {
              result.biographie = pseudo + " n'a pas de biographie";
            }
            if (result.username != undefined) {
              const exampleEmbed = new EmbedBuilder()
                .setColor(couleur)
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
                  { name: "ÉPISODES VUS", value: "" + addition, inline: true },
                  { name: "ÉPISODES REWATCH", value: "" + revisionage, inline: true }
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
        
              await interaction.editReply({ embeds: [exampleEmbed] });
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
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&845340817828479026>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == roleMembre);
            await interaction.member.roles.add(role);
            break;
        case 'role-patchnote':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&1012649092343668857>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == rolePatchNotes);
            await interaction.member.roles.add(role);
            break;
        case 'role-ios':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&949075801637281812>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == roleIos);
            await interaction.member.roles.add(role);
            break;
        case 'role-android':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&949360235011776533>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == roleAndroid);
            await interaction.member.roles.add(role);
            break;
        case 'role-siteweb':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&949075846113669131>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == roleSite);
            await interaction.member.roles.add(role);
            break;
        case 'role-bonplan':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&948247271290572850>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == roleBonPlan);
            await interaction.member.roles.add(role);
            break;
        case 'role-genshin':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&948247223894954074>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == roleGenshin);
            await interaction.member.roles.add(role);
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
