const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const {logoUrl, urlEndpoint} = require("../config.json");
const diffuseurEmoji = require("../diffuseurEmoji.json");
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
                    { name: "Semaine", value: "week" }
                )
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.options.getString("type") === "week" ? "timeline" : "day";
        const result = await fetch(`${urlEndpoint}/agenda/${type}`);
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
            embed.setTitle(`Agenda du Jour`);
            
            listAnime.forEach(async (anime) => {
                if(!anime.episode.displayCalendar) return
                const date = new Date(anime.episode.timestamp);
                const timeString = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
                let diffuseur = "";
                if(anime.media.diffuseur) {
                    //une simple vérification pour voir si le fichier diffuseurEmoji.json est rempli ou pas (si vous modifiez un texte dans le fichier ça ira dans le if)
                    if(diffuseurEmoji["Crunchyroll"] !== "REMPLIR AVEC UN EMOJI" || diffuseurEmoji["Disney"] !== "REMPLIR AVEC UN EMOJI" || diffuseurEmoji["Netflix"] !== "REMPLIR AVEC UN EMOJI" || diffuseurEmoji["ADN"] !== "REMPLIR AVEC UN EMOJI" || diffuseurEmoji["Prime"] !== "REMPLIR AVEC UN EMOJI") {
                        diffuseur = await getDiffuseurEmoji(anime.media.diffuseur);
                    }
                }
                embed.addFields({
                    name: `**${timeString}**`,
                    value:`${diffuseur} ${anime.episode.animeTitle.length > 17 ? anime.episode.animeTitle.substring(0, 20) + "..." : anime.episode.animeTitle} - ${anime.episode.title}`}
                );
            });
        }else if(type === "timeline") {
            embed.setTitle(`Agenda de la Semaine`);
            const week = [[], [], [], [], [], [], []];
            for (let j = 0; j < response.length; j++) {
                const listAnime = response[j].airing
                for (let i = 0; i < listAnime.length; i++) {
                    const anime = listAnime[i];
                    if(!anime.displayCalendar) return
                    const date = new Date(anime.timestamp);
                    const timeString = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
                    
                    let info = {
                        name: `${anime.animeTitle.length > 17 ? anime.animeTitle.substring(0, 20) + "..." : anime.animeTitle}`,
                        value: `${anime.title}`,
                        timestamp: `**${timeString}**`,
                        date: `${date.toLocaleDateString("fr-FR", { weekday: "long" }).charAt(0).toUpperCase() + date.toLocaleDateString("fr-FR", { weekday: "long" }).slice(1)} ${date.getDate()} ${date.toLocaleDateString("fr-FR", { month: "long" })}`,
                    }
                    if(anime.media.diffuseur) {
                        //une simple vérification pour voir si le fichier diffuseurEmoji.json est rempli ou pas (si vous modifiez un texte dans le fichier ça ira dans le if)
                        if(diffuseurEmoji["Crunchyroll"] !== "REMPLIR AVEC UN EMOJI" || diffuseurEmoji["Disney"] !== "REMPLIR AVEC UN EMOJI" ||diffuseurEmoji["Netflix"] !== "REMPLIR AVEC UN EMOJI" || diffuseurEmoji["ADN"] !== "REMPLIR AVEC UN EMOJI" || diffuseurEmoji["Prime"] !== "REMPLIR AVEC UN EMOJI") {
                            info.diffuseur = await getDiffuseurEmoji(anime.media.diffuseur);
                        }
                    }
                    

                    week[j].push(info);
                };
            }
            week.map((day) => {
                if(day.length === 0) return
                embed.addFields({
                    name: `${day[0].date}`,
                    value: day.map((anime) => `${anime.timestamp} - ${anime.name} - ${anime.value} ${anime?.diffuseur ? `- ${anime.diffuseur}` : ""}`).join("\n")
                });
            });
        }

        interaction.editReply({ embeds: [embed] });
    }
};


async function getDiffuseurEmoji(listDiffuseur) {
        let emoji = "";
        Object.keys(listDiffuseur).map((key) => {
            emoji += `${diffuseurEmoji[key]} `;
        });
        return emoji;
}