const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const dayjs = require('dayjs')
require('dayjs/locale/fr')

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
            choix = 'unedifined';
        }

        // Choix jour / par défaut
        if (choix === 'unedifined' || choix === 'jour') {
            dayjs.locale("fr")
            var now = dayjs().hour(0).minute(0).second(0);
            var après = now.add((1), "day");
            now = now.valueOf();
            après = après.valueOf();
            let response = await fetch(
                "https://api.hyakanime.fr/episode/sortie-hebdo/" +
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
                    timestamp[b] = dayjs(result[i].timestamp).format("H:mm");
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
            i = 0
            while (i < nom.length) {
                exampleEmbed.addFields({ name: timestamp[i], value: nom[i].slice(0, 43) + " - " + episode[i], inline: false })
                i++;
            }

            await interaction.editReply({ embeds: [exampleEmbed] });
        }
        else {
            console.log("test");
            var now = dayjs().day(1).hour(0).minute(0).second(0);
            var après = now.add((7), "day");
            now = now.valueOf();
            après = après.valueOf();
            let response = await fetch(
                "https://api.hyakanime.fr/episode/sortie-hebdo/" +
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
            let horodatages = [[], [], [], [], [], [], []]; //0 = dimanche - 1 = lundi
            while (i < result.length) {
                if (result[i].displayCalendar == true) {
                    let jour = dayjs(result[i].timestamp).day();
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
                for (let i = 0; i < horodatages[jour].length; i++) {
                    var heure = dayjs(horodatages[jour][i].horodatage).format("H:mm");
                    animeJour += `**${heure}** - ${horodatages[jour][i].animeTitle} - ${horodatages[jour][i].episode}\n`;
                }
                semaineEmbed.addFields({ name: jourSemaine[jour], value: animeJour, inline: false });
            }

            // Ajouter le dimanche à la fin
            let animeJour = "";
            for (let i = 0; i < horodatages[0].length; i++) {
                var heure = dayjs(horodatages[0][i].horodatage).format("H:mm");
                animeJour += `**${heure}** - ${horodatages[0][i].animeTitle} - ${horodatages[0][i].episode}\n`;
            }
            semaineEmbed.addFields({ name: jourSemaine[0], value: animeJour, inline: false });

            await interaction.editReply({ embeds: [semaineEmbed] });
        }
    }
}
