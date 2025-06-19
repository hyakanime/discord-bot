const { EmbedBuilder } = require('discord.js');

module.exports = async function(interaction, settings) {
    const embed = new EmbedBuilder()
        .setTitle('Paramètres actuels du serveur')
        .setColor(0x0099FF)
        .addFields(
            { name: 'Bienvenue', value: settings.welcomeEnabled ? 'Activé' : 'Désactivé', inline: true },
            { name: 'Canal de bienvenue', value: settings.welcomeChannelId ? `<#${settings.welcomeChannelId}>` : 'Non défini', inline: true },
            { name: 'Embed de lien Hyakanime', value: settings.hyakanimeLinkEmbedEnabled ? 'Activé' : 'Désactivé', inline: true },
            { name: 'Alerte d\'édition', value: settings.editAlertEnabled ? 'Activé' : 'Désactivé', inline: true },
            { name: 'Canal d\'alerte d\'édition', value: settings.editAlertChannelId ? `<#${settings.editAlertChannelId}>` : 'Non défini', inline: true }
        )
        .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
};
