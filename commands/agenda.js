const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
require("dayjs/locale/fr");
const {logoUrl, urlEndpoint} = require("../config.json");
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Paris");

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
        var choix;
        const typeOption = interaction.options.get("type");
        if (typeOption) {
            choix = typeOption.value;
        } else {
            choix = "unedifined";
        }

        // Fonction pour convertir l'heure UTC en heure Paris
        function convertToParisTime(utcTime) {
            return dayjs(utcTime).utc().tz("Europe/Paris").format("H:mm");
        }

        // Choix jour / par défaut
        if (choix === "unedifined" || choix === "jour") {
            var now = dayjs().hour(0).minute(0).second(0);
            var après = now.add((1), "day");
            now = now.valueOf()-3600000;
            après = après.valueOf()-3600000;
            let response = await fetch(
                urlEndpoint+"/episode/sortie-hebdo/" +
                now +
                "/" +
                après,
                {
                    method: "GET",
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
                    timestamp[b] = convertToParisTime(result[i].timestamp);
                    b++;
                }
                i++;
            }
            const jourEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("Agenda du Jour")
                .setURL("https://hyakanime.fr/agenda")
                .setAuthor({
                    name: "hyakanime",
                    iconURL:
                        logoUrl,
                    url: "https://hyakanime.fr",
                })
                .setTimestamp();
            i = 0;
            while (i < nom.length) {
                jourEmbed.addFields({ name: timestamp[i], value: nom[i].slice(0, 40) + " - " + "**"+episode[i]+"**", inline: false });
                i++;
            }

            await interaction.editReply({ embeds: [jourEmbed] });
        }
        else {
            now = dayjs().day(1).hour(0).minute(0).second(0);
            après = now.add((7), "day");
            now = now.valueOf()-3600000;
            après = après.valueOf()-3600000;
            let response = await fetch(
                "https://api-v2.hyakanime.fr/episode/sortie-hebdo/" +
                now +
                "/" +
                après,
                {
                    method: "GET",
                }
            );

            let data = await response.text();
            result = JSON.parse(data);
            i = 0;
            let horodatages = [[], [], [], [], [], [], []]; //0 = dimanche - 1 = lundi
            while (i < result.length) {
                if (result[i].displayCalendar == true) {
                    let jour = dayjs.utc(result[i].timestamp).utcOffset(120).day();
                    let donnees = {
                        horodatage: result[i].timestamp,
                        animeTitle: result[i].animeTitle,
                        episode: result[i].title
                    };
                    horodatages[jour].push(donnees);
                }
                i++;
            }
            const jourSemaine = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
            var semaineEmbed = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("Agenda de la Semaine")
                .setURL("https://hyakanime.fr/agenda")
                .setAuthor({
                    name: "hyakanime",
                    iconURL: "https://www.hyakanime.fr/static/media/appLogo.7fac0ec4359bda8ccf0f.png",
                    url: "https://hyakanime.fr",
                })
                .setTimestamp();

            for (let jour = 1; jour < 7; jour++) {
                let animeJour = "";
                let animeJourPartie2 = "";
                let longueur = 0; // Utilisez une variable pour stocker la longueur actuelle
                  
                for (let i = 0; i < horodatages[jour].length; i++) {
                    var heure = convertToParisTime(horodatages[jour][i].horodatage);
                    const animeTitle = horodatages[jour][i].animeTitle.slice(0, 30);
                    const episode = horodatages[jour][i].episode.replace("Épisode", "Ep");
                    const animeString = `**${heure}** - ${animeTitle} - **${episode}**\n`;
                  
                    if (longueur + animeString.length <= 970) {
                        animeJour += animeString;
                        longueur += animeString.length;
                    } else {
                        animeJourPartie2 += animeString;
                    }
                }
                semaineEmbed.addFields({ name: jourSemaine[jour], value: animeJour, inline: false });
                  
                if (animeJourPartie2 !== "") {
                    semaineEmbed.addFields({ name: jourSemaine[jour]+ " Partie 2", value: animeJourPartie2, inline: false });
                }
            }
                  
            // Ajouter le dimanche à la fin
            let animeJour = "";
            for (let i = 0; i < horodatages[0].length; i++) {
                heure = convertToParisTime(horodatages[0][i].horodatage);
                animeJour += `**${heure}** - ${horodatages[0][i].animeTitle.slice(0,30)} - **${horodatages[0][i].episode.replace("Épisode", "Ep")}**\n`;
            }
            semaineEmbed.addFields({ name: jourSemaine[0], value: animeJour, inline: false });

            await interaction.editReply({ embeds: [semaineEmbed]});

        }
    }
};
