const { Partials, Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { token } = require('./config.json');

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

                role = interaction.guild.roles.cache.find(role => role.id == "1036572391201054730");
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
                client.channels.cache.get("1036762035645599755").send({ content: '', embeds: [embedbetaAdmin] })

                await interaction.reply({ content: '', embeds: [embedBeta], ephemeral: true });

            }
            else {
                interaction.reply({ content: "Format de l'email invalide", ephemeral: true })
            }

            break;

    }


});


// message a l'arrivée d'un membre
client.on('guildMemberAdd',async (member) => {
    let Pseudo = member.user.id;
    console.log("ca marche");

    let number = Math.floor(Math.random() * Math.floor(23));

    let phrases = [
        `<@${Pseudo}> vient d'arriver en Naruto run !`,
        `<@${Pseudo}> viens de manger un fruit du Démon`,
        `<@${Pseudo}> débarque dans le bataillon d'exploration !`,
        `L'équipage au chapeau de paille n'attendait que <@${Pseudo}>, en route vers Grand line !`,
        `Le Vogue Merry accueil enfin <@${Pseudo}> !`,
        `<@${Pseudo}> rejoint le thousand sunny !`,
        `<@${Pseudo}> rejoint les rangs des pourfondeurs de démon !`,
        `<@${Pseudo}> vient de rejoindre Karasuno !`,
        `On l'attendait.. <@${Pseudo}> s'installe enfin à  Konoha !`,
        `<@${Pseudo}> vient de rejoindre Nekoma !`,
        `L'académie des Ninja accueil un nouvel arrivant.. <@${Pseudo}>`,
        `<@${Pseudo}> devient Shinigami !`,
        `<@${Pseudo}> s'enfonce dans les fin-fond de l'abysse...`,
        `Senku accueil <@${Pseudo}> au village d'Ishigami !`,
        `Kuchiyose <@${Pseudo}> no Jutsu`,
        `Le rêve de <@${Pseudo}>... devenir Hokage`,
        `<@${Pseudo}> intègre l'Akatsuki`,
        `Après 3 essais.. <@${Pseudo}> passe l'examen Genin ..`,
        `<@${Pseudo}> passe haut la main son examen Hunter`,
        `<@${Pseudo}> fait la rencontre du Hokage`,
        `Ore wa <@${Pseudo}>`,
        `<@${Pseudo}> nous défi en duel de chef !`,
        `Un nouveau membre du conseil des dix maître est là .. <@${Pseudo}>`,
        `Un nouveau membre de l'Akatsuki <@${Pseudo}>`,
    ];

    if (number == phrases.lenght) {
        number = Math.floor(Math.random() * Math.floor(3));
    }

    var avatar = member.user.avatarURL()
    console.log(avatar);
    console.log(phrases[number]);
    const embedBienvenue = new EmbedBuilder()
        .setTitle("Nouveau membre !")
        .setDescription(phrases[number])
        .setThumbnail(avatar)
        .setFooter({text:'Hyakanime', iconUrl: avatar})
        .setColor('#35B0FF')

    const channel = client.channels.cache.get("744950913382481980");
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
            role = interaction.guild.roles.cache.find(role => role.id == "845340817828479026");
            await interaction.member.roles.add(role);
            break;
        case 'role-patchnote':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&1012649092343668857>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == "1012649092343668857");
            await interaction.member.roles.add(role);
            break;
        case 'role-ios':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&949075801637281812>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == "949075801637281812");
            await interaction.member.roles.add(role);
            break;
        case 'role-android':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&949360235011776533>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == "949360235011776533");
            await interaction.member.roles.add(role);
            break;
        case 'role-siteweb':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&949075846113669131>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == "949075846113669131");
            await interaction.member.roles.add(role);
            break;
        case 'role-bonplan':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&948247271290572850>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == "948247271290572850");
            await interaction.member.roles.add(role);
            break;
        case 'role-genshin':
            interaction.reply({ content: 'Vous venez de recevoir le rôle <@&948247223894954074>', ephemeral: true });
            role = interaction.guild.roles.cache.find(role => role.id == "948247223894954074");
            await interaction.member.roles.add(role);
            break;
        default:
            interaction.reply({ content: 'Une erreur est survenue, contactez <@&245604480278593537>', ephemeral: true });
            break;
    }
});




client.login(token);

