const { Events, Embed, EmbedBuilder, EmbedType } = require('discord.js');
const { urlEndpoint, logoUrl } = require("../config.json");
const schedule = require('node-schedule');
const cron = require("node-cron");
const mongoose = require("mongoose");
const diffuseurEmoji = require("../diffuseurEmoji.json");
module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        await getReleasesAnime(client);
        cron.schedule('0 2 * * *', async () => {
            await getReleasesAnime(client, true);
        });
    }
}

function getDiffuserUrl(listDiffuseur) {
    try {
        let diffuseursWithUrl = [];
        Object.keys(listDiffuseur).map((key) => {
            if (listDiffuseur[key] === "") return;
            if (diffuseurEmoji[key] === undefined || diffuseurEmoji[key] === "REMPLIR AVEC UN EMOJI") {
                diffuseursWithUrl.push(`\n ### [${key}](${listDiffuseur[key]})`);
            } else {
                diffuseursWithUrl.push(`\n ### ${diffuseurEmoji[key]} [${key}](${listDiffuseur[key]})`);
            }
        });
        return diffuseursWithUrl;
    } catch (error) {
        return [];
    }
}

async function getReleasesAnime(client, isCron = false) {
    try {
        const result = await fetch(`${urlEndpoint}/agenda/day`);
        const data = await result.json();
        const guilds = await mongoose.connection.db.collection('guildsettings').find({}).toArray();
        if (guilds.length === 0) return;
        guilds.map(async (guild) => {
            if (guild.animeNotifEnabled && guild.animeNotifChannelId) {
                const channel = client.channels.cache.get(guild.animeNotifChannelId);
                if (channel) {
                    data.map((anime) => {
                        if (!anime.episode.displayCalendar) return;
                        const diffuseurs = getDiffuserUrl(anime.media.diffuseur ? anime.media.diffuseur : "");
                        const nameAnime = anime.episode.animeTitle || anime.media.title || anime.media.romanji || anime.media.titleJP || "Titre inconnu";
                        const embed = new EmbedBuilder()
                            .setColor("#0099ff")
                            .setTitle('Nouvel épisode !')
                            .setDescription(`
                    ### [${nameAnime}](https://hyakanime.fr/anime/${anime.episode.animeID})\n${anime.episode.title}
                    ${diffuseurs.join("")}`)
                            .setThumbnail(anime.media.image)
                            .setTimestamp(anime.episode.timestamp)
                            .setImage("https://cdn.discordapp.com/attachments/706184503651205182/1381266976432853082/1749390098906.png?ex=6846e49d&is=6845931d&hm=ab62c5da8ba11f6f126699afa4b2c2bdb8dc2a26c4972253cef8dd8f7bf98331&")
                            .setFooter({
                                text: `Source : Hyakanime`,
                                iconURL: logoUrl,
                            })
                            if (anime.episode.timestamp < Date.now()) {
                                if(isCron){
                                    channel.send({ embeds: [embed] }).then((message) => {
                                        message.react("👁️").catch(console.error);
                                    }).catch(error => {
                                        console.error("Error sending message:", error);
                                    });
                                }
                                return;
                            } else {
                                schedule.scheduleJob(new Date(anime.episode.timestamp), () => {
                                    channel.send({ embeds: [embed] }).then((message) => {
                                        message.react("👁️").catch(console.error);
                                    }).catch(error => {
                                        console.error("Error sending message:", error);
                                    });
                                });
                            }
                        
                    });
                }
            }
        })

    }
    catch (error) {
        console.error("Error fetching agenda:", error);
    }
}