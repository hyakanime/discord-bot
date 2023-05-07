const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const dayjs = require('dayjs')
require('dayjs/locale/fr')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("agenda")
        .setDescription("Fournit l'agenda du jour."),

    async execute(interaction) {
        await interaction.deferReply();
        dayjs.locale("fr")
        var now = dayjs().hour(0).minute(0).second(0);
        var après = now.add((1), "day");
        now = now.valueOf();
        après = après.valueOf();
        console.log(now)
        console.log(après)
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
};
