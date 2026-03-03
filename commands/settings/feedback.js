// commands/settings/feedback.js
const { EmbedBuilder } = require('discord.js');

module.exports = async (interaction, settings) => {
    const enable = interaction.options.getBoolean('enable');
    const channel = interaction.options.getChannel('channel');

    settings.feedbackEnabled = enable;
    if (channel) {
        settings.feedbackChannelId = channel.id;
    } else if (enable && !settings.feedbackChannelId) {
        // If enabling but no channel provided and no previous channel set
        settings.feedbackChannelId = interaction.channelId;
    } else if (!enable) {
        settings.feedbackChannelId = undefined;
    }

    const embed = new EmbedBuilder()
        .setColor(enable ? '#00FF00' : '#FF0000')
        .setTitle('Paramètres de Retours Hyakanime Mis à Jour')
        .setDescription(`Les notifications de retours (bugs/suggestions) de l'API Hyakanime ont été ${enable ? 'activées' : 'désactivées'}.`)
        .setTimestamp();

    if (enable) {
        embed.addFields({ name: 'Salon', value: `<#${settings.feedbackChannelId}>` });
    }

    await interaction.editReply({ embeds: [embed] });
};
