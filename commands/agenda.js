const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const {logoUrl, urlEndpoint} = require("../config.json");
const { fetchUserData} = require("../function/user.js");
const UserEmbedCache = require('../models/UserEmbedCache');
let timeoutId;

async function getFromCache(pseudo) {
  try {
    const cachedResult = await UserEmbedCache.findOne({ pseudo, expiresAt: { $gt: new Date() } });
    return cachedResult?.userData ? cachedResult.userData : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du cache:', error);
    return null;
  }
}

async function addToCache(pseudo, userData) {
  try {
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 1);
    await UserEmbedCache.updateOne({ pseudo }, { pseudo, userData, expiresAt }, { upsert: true });
  } catch (error) {
    console.error('Erreur lors de l\'ajout au cache:', error);
  }
}
let diffuseurEmoji = require("../diffuseurEmoji.json");
diffuseurEmoji = Object.fromEntries(
    Object.entries(diffuseurEmoji).map(([key, value]) => [key.toLowerCase(), value])
);
module.exports = {
    data: new SlashCommandBuilder()
        .setName("agenda")
        .setDescription("Fournit l'agenda du jour.")
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("Agenda afficher par Jour ou Semaine ?")
                .setRequired(false)
                .addChoices(
                    { name: "Jour", value: "day" },
                    { name: "Semaine", value: "timeline" }
                )
        )
        .addBooleanOption(option => option
            .setName("visible")
            .setDescription("Afficher l'agenda pour tout le monde ?")
            .setRequired(false)
        )
        .addStringOption(option => 
            option.setName("pseudo")
            .setDescription("Votre pseudo Hyakanime")
            .setAutocomplete(true)
            .setRequired(false)),
        async autocomplete(interaction) {
            const pseudo = interaction.options.getFocused() || "te";
            clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
              const response = await fetch(urlEndpoint + "/search/user/" + pseudo), data = await response.text(), result = JSON.parse(data), choices = [];
              for (let i = 0; i < result.length && i <= 10; i++) {
                if (result[i] == undefined) return;
                choices.push({ username: result[i].username, uid: result[i].uid });
              }
              await interaction.respond(choices.map(choice => ({ name: choice.username, value: `${choice.username}` })));
            }, 300);
          },
    async execute(interaction) {
        const visible = interaction.options.getBoolean("visible") || false;
        const flags = visible ? 0 : 64;
        await interaction.deferReply({ flags });
        const pseudo = interaction.options.getString("pseudo") || null;
        const type = interaction.options.getString("type") || "day";
        let userData = null;
        if(pseudo){
            try{
                userData = await getFromCache(pseudo);
                if (!userData) {
                    const response = await fetch(urlEndpoint + "/user/" + pseudo);
                    const data = await response.text();
                    userData = JSON.parse(data);
                    if (userData?.message) {
                        const response2 = await fetch(urlEndpoint + "/search/user/" + pseudo);
                        const result2 = JSON.parse(await response2.text());
                        if (result2.length == 0) return null;
                        userData = result2[0];
                    }
                    if (!userData) return await interaction.editReply("Erreur lors de la récupération du compte");
                    await addToCache(pseudo, userData);
                }
            }catch(error){
                interaction.editReply("Erreur lors de la récupération du compte");
            }
        }
        const result = await fetch(`${urlEndpoint}/agenda/${type}?uid=${userData === null ? "" : userData.uid}`);
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
            .setURL("https://hyakanime.fr/agenda")
        
        if(type === "day") {
            
            const listAnime = response.map((anime) => ({
                ...anime,
                timestamp: Number(anime.episode.timestamp),
            })).sort((a, b) => a.timestamp - b.timestamp);
            embed.setTitle(`Agenda du Jour ${userData ? `de ${userData.username}` : ""}`);
            
            for(anime of listAnime) {
                if(!anime.episode.displayCalendar) return
                const date = new Date(anime.episode.timestamp);
                const timeString = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
                let diffuseur = "";
                if (anime.media.streaming?.length && isDiffuseurEmojiFilled()) {
                    diffuseur = await getDiffuseurEmoji(anime.media.streaming);
                }
                embed.addFields({
                    name: `**${timeString}**`,
                    value:`${diffuseur} ${anime.episode.animeTitle ? anime.episode.animeTitle.length > 12 ? anime.episode.animeTitle.substring(0, 13) + "..." : anime.episode.animeTitle : anime.media.title ? anime.media.title.length > 12 ? anime.media.title.substring(0, 14) + "..." : anime.media.title : anime.media.romanji ? anime.media.romanji.length > 12 ? anime.media.romanji.substring(0, 14) + "..." : anime.media.romanji : anime.media.titleJP ? anime.media.titleJP.length > 12 ? anime.media.titleJP.substring(0, 14) + "..." : anime.media.titleJP : "Titre inconnu"} - ${anime.episode.title}`}
                );
            }
        }else if(type === "timeline") {
            embed.setTitle(`Agenda de la Semaine ${userData ? `de ${userData.username}` : ""}`);
            const week = [[], [], [], [], [], [], []];
            for (let j = 0; j < response.length; j++) {
                const listAnime = response[j].airing
                for (let i = 0; i < listAnime.length; i++) {
                    const anime = listAnime[i];
                    if(!anime.displayCalendar) return
                    const date = new Date(anime.timestamp);
                    const timeString = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
                    
                    let info = {
                        name: `${anime.animeTitle ? anime.animeTitle.length > 12 ? anime.animeTitle.substring(0, 13) + "..." : anime.animeTitle : anime.media.title ? anime.media.title.length > 12 ? anime.media.title.substring(0, 14) + "..." : anime.media.title : anime.media.romanji ? anime.media.romanji.length > 12 ? anime.media.romanji.substring(0, 14) + "..." : anime.media.romanji : anime.media.titleJP ? anime.media.titleJP.length > 12 ? anime.media.titleJP.substring(0, 14) + "..." : anime.media.titleJP : "Titre inconnu"}`,
                        value: `Ep ${anime.number}`,
                        timestamp: `**${timeString}**`,
                        date: `${date.toLocaleDateString("fr-FR", { weekday: "long" }).charAt(0).toUpperCase() + date.toLocaleDateString("fr-FR", { weekday: "long" }).slice(1)} ${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "long" })}`,
                    }
                    if (anime.media.streaming?.length && isDiffuseurEmojiFilled()) {
                        info.diffuseur = await getDiffuseurEmoji(anime.media.streaming);
                    }
                    

                    week[j].push(info);
                };
            }
            week.map((day) => {
                if(day.length === 0) return
                let length = 0;
                const listIndex = []
                embed.addFields({
                    name: `${day[0].date}`,
                    value: day.map((anime, index) => {
                        length += `${anime.timestamp} - ${anime.name} - ${anime.value} ${anime?.diffuseur ? `- ${anime.diffuseur}` : ""}`.length
                        if(length > 950){
                            listIndex.push(index);
                            return null
                        }
                        return`${anime.timestamp} - ${anime.name} - ${anime.value} ${anime?.diffuseur ? `- ${anime.diffuseur}` : ""}`
                    }).join("\n")
                });
                if(listIndex.length > 0) {
                    embed.addFields({
                        name: `${day[0].date} (suite)`,
                        value: listIndex.map((index) => {
                            return `${day[index].timestamp} - ${day[index].name} - ${day[index].value} ${day[index]?.diffuseur ? `- ${day[index].diffuseur}` : ""}`
                        }).join("\n")
                    });
                }
            });
        }

        interaction.editReply({ embeds: [embed] });
    }
};


async function getDiffuseurEmoji(streamingList) {
    let emoji = "";
    for (const streaming of streamingList) {
        const key = streaming.source?.toLowerCase();
        if (key && diffuseurEmoji[key] && diffuseurEmoji[key] !== "REMPLIR AVEC UN EMOJI") {
            emoji += diffuseurEmoji[key];
        }
    }
    return emoji;
}

function isDiffuseurEmojiFilled() {
    return Object.values(diffuseurEmoji).some(v => v !== "REMPLIR AVEC UN EMOJI");
}