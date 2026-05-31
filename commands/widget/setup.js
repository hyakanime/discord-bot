const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const {logoUrl, urlEndpoint, oauth2} = require("../../config.json");
module.exports = {
    async execute(interaction) {
        const button = new ButtonBuilder()
            .setLabel("Accéder au widget")
            .setURL(oauth2)
            .setStyle(ButtonStyle.Link);
        const embed = new EmbedBuilder()
            .setTitle("Widget Hyak")
            .setDescription("Clique sur le bouton ci-dessous pour accéder au widget Hyak. Le widget est affiché que sur ordinateur/navigateur. \n\nQuand vous aurez accepté le widget, il faut faire la commande /widget refresh")
            .setThumbnail(logoUrl);
        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row], flags: 64});
    }
};

