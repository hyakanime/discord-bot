const { EmbedBuilder } = require('discord.js');

module.exports = async function(interaction, settings) {
    const embed = new EmbedBuilder()
        .setTitle('Paramètres actuels du serveur')
        .setColor(0x0099FF)
        .addFields(
            { name: 'Bienvenue', value: settings.welcomeEnabled ? (settings.welcomeChannelId ? `Activé: <#${settings.welcomeChannelId}>` : 'Activé: Non défini') : 'Désactivé', inline: true },
            { name: 'Embed de lien Hyakanime', value: settings.hyakanimeLinkEmbedEnabled ? 'Activé' : 'Désactivé', inline: true },
            { name: 'Alerte Edition', value: settings.editAlertEnabled ? (settings.editAlertChannelId ? `Activé: <#${settings.editAlertChannelId}>` : 'Activé: Non défini') : 'Désactivé', inline: true }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
};
