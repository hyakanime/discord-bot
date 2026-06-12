const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const { logoUrl } = require("../../config.json");

const tutoUrl = "https://widget-hyak.zaphir21.dev/";

module.exports = {
    async execute(interaction) {
        const button = new ButtonBuilder()
            .setLabel("Voir le tutoriel")
            .setURL(tutoUrl)
            .setStyle(ButtonStyle.Link);
        const embed = new EmbedBuilder()
            .setTitle("Widget Hyak")
            .setDescription("L'ajout du widget n'est plus possible directement via Discord. Clique sur le bouton ci-dessous pour suivre le tutoriel et configurer le widget Hyak sur ton profil.")
            .setThumbnail(logoUrl);
        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row], flags: 64 });
    }
};

