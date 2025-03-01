const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const {logoUrl, urlEndpoint} = require("../config.json");
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
                    { name: "Jour", value: "jour" },
                    { name: "Semaine", value: "Semaine" }
                )
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const type = interaction.options.getString("type") || "jour";
        let start = new Date();
        start.setHours(0, 0, 0, 0);
        let end = new Date();
        if (type === "jour") {
            end.setHours(23, 59, 59, 999);
        } else {
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        }
        const result = await fetch(`${urlEndpoint}/episode/sortie-hebdo/${start.getTime()}/${end.getTime()}`);
        const data = await result.text();
        const response = JSON.parse(data);
            let listAnime = response.map((anime) => ({
                ...anime,
                timestamp: Number(anime.timestamp),
            })).sort((a, b) => a.timestamp - b.timestamp);
        const embed = new EmbedBuilder()
            .setAuthor({
                name: "hyakanime",
                iconURL:
                    logoUrl,
                url: "https://hyakanime.fr",
            })
            .setColor("#0099ff")
            .setURL("https://hyakanime.fr/agenda")

        if(type === "jour") {
            embed.setTitle(`Agenda du Jour`);
            listAnime.forEach((anime) => {
                if(!anime.displayCalendar) return
                const date = new Date(anime.timestamp);
                const timeString = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
                embed.addFields({
                    name: `**${timeString}**`,
                    value:`${anime.animeTitle.length > 17 ? anime.animeTitle.substring(0, 20) + "..." : anime.animeTitle} - ${anime.title}`}
                );
            });
        }else if(type === "Semaine") {
            embed.setTitle(`Agenda de la Semaine`);
            const week = [[], [], [], [], [], [], []];//0 = dimanche, 1 = lundi,...  6 = samedi
            listAnime.map((anime) => {
                if(!anime.displayCalendar) return
                const date = new Date(anime.timestamp);
                const timeString = date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" });
                week[date.getDay()].push({
                    name: `${anime.animeTitle.length > 17 ? anime.animeTitle.substring(0, 20) + "..." : anime.animeTitle}`,
                    value: `${anime.title}`,
                    timestamp: `**${timeString}**`
                });
            });
            //passer le dimanche en dernier
            week.push(week.shift());
            week.map((day, index) => {
                if(day.length === 0) return
                let dayName = "";
                switch(index) {
                    case 0:
                        dayName = "Lundi";
                        break;
                    case 1:
                        dayName = "Mardi";
                        break;
                    case 2:
                        dayName = "Mercredi";
                        break;
                    case 3:
                        dayName = "Jeudi";
                        break;
                    case 4:
                        dayName = "Vendredi";
                        break;
                    case 5:
                        dayName = "Samedi";
                        break;
                    case 6:
                        dayName = "Dimanche";
                        break;
                }

                embed.addFields({
                    name: `${dayName}`,
                    value: day.map((anime) => `${anime.timestamp} - ${anime.name} - ${anime.value}`).join("\n")
                });
            });
        }

        interaction.editReply({ embeds: [embed] });
    }
};
