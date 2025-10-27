const { Events, EmbedBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require("discord.js");
const fetch = require("node-fetch");
const { logoUrl, urlEndpoint } = require("../config.json");
const { fetchUser } = require("../function/user.js");
const { fetchAnime } = require("../function/anime.js");
const GuildSettings = require('../models/GuildSettings');

module.exports = {
    name: Events.MessageCreate,
    async execute(msg) {

        if (msg.author.bot || !msg.content) return;

        msg.content = msg.content.toLowerCase();
        if (!msg.content.includes("://")) return;
        const message = msg.content;
        const regex = /https?:\/\/[^\s]+/g;
        const link = message.match(regex)[0];
        if (!link) return;
        let info = link.replace("https://", "").replace("http://", "").replace("www.", "").split("/");
        if (info[0] === "hyakanime.fr") {
        // Récupérer les paramètres du serveur
        const guildSettings = await GuildSettings.findOne({ guildId: msg.guild.id });

        // Vérifier si l'embed de lien est activé pour ce serveur
        if (!guildSettings?.hyakanimeLinkEmbedEnabled) return;
            if (info[1] === "anime") {
                if (info[2] === undefined || info[2] === "") return;
                let buttonClicked = false;
                const result = await fetch(`${urlEndpoint}/anime/${info[2]}`);
                const data = await result.text();
                const response = JSON.parse(data);
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: "hyakanime",
                        iconURL:
                            logoUrl,
                        url: "https://hyakanime.fr",
                    })
                    .setColor("#0099ff")
                    .setTitle(response.title ? response.title : response.titleEN ? response.titleEN : response.romanji ? response.romanji : response.titleJP)
                    .setURL(`https://hyakanime.fr/anime/${response.id}`)

                    .setTimestamp();
                if (!response.adult) {
                    embed.setDescription(response.synopsis === undefined ? "Pas de synopsis renseigné." : response.synopsis.slice(0, 200) + "...")
                    if(response.image !== undefined){
                        embed.setThumbnail(response.image)
                    }
                } else {
                    embed.setDescription("Ce contenu est réservé à un public averti.")
                }
                await msg.suppressEmbeds(true);
                if(response.adult){
                    await msg.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
                    return;
                }
                const button = new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setLabel("Voir plus...")
                    .setEmoji("👀")
                    .setCustomId(`animeButton_${response.id}_${msg.id}`);

                const message = await msg.reply({ embeds: [embed], allowedMentions: { repliedUser: false }, components: [new ActionRowBuilder().addComponents(button)] });
                const collector = msg.channel.createMessageComponentCollector({
                    componentType: ComponentType.Button,
                    time: 30000, // durée du bouton 
                    filter: (i) => i.customId === `animeButton_${response.id}_${msg.id}`,
                });

                collector.on('collect', async i => {
                    
                    if (!buttonClicked) {
                        const newEmbed = await fetchAnime(response.id, response);
                        if(msg.author.id === i.user.id){
                            button.setLabel("Voir moins...")
                            await i.update({ embeds: [newEmbed], components: [new ActionRowBuilder().addComponents(button)] });
                            buttonClicked = !buttonClicked;
                        }else{
                            i.reply({ embeds: [newEmbed], components: [], flags: 64 });
                        }
                        
                    } else {
                        if(msg.author.id === i.user.id){
                            button.setLabel("Voir plus...")
                            await i.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(button)] });
                            buttonClicked = !buttonClicked;
                        }else{
                            i.reply({ embeds: [embed], components: [], flags: 64 });
                        }
                    }
                });
                collector.on('end', async () => {
                    await message.edit({ components: [] });
                });
            } else if (info[1] === "user") {
                if (info[2] === undefined || info[2] === "") return;
                let pseudo = info[2];
                const { userEmbed, attachment } = await fetchUser(pseudo, EmbedBuilder, AttachmentBuilder);
                if (userEmbed == null) {
                    return;
                }

                await msg.suppressEmbeds(true);
                await msg.reply({ embeds: [userEmbed], allowedMentions: { repliedUser: false }, files: [attachment] });
            }
        }
    }
}
