module.exports = async function(interaction, settings) {
    const enable = interaction.options.getBoolean('enable');
    const channel = interaction.options.getChannel('channel');

    if (enable !== null) {
        settings.editAlertEnabled = enable;
    }

    if (channel) {
        if (channel.guildId !== interaction.guildId) {
            await interaction.editReply('❌ Erreur: Le canal spécifié ne fait pas partie de ce serveur.');
            return;
        }
        settings.editAlertChannelId = channel.id;
    } else if (interaction.options.get('channel') !== null) {
        settings.editAlertChannelId = undefined;
    }

    if (settings.editAlertEnabled && !settings.editAlertChannelId) {
        await interaction.editReply('⚠️ Attention: Les alertes d\'édition sont activées mais aucun canal n\'est spécifié. Les alertes ne seront pas envoyées.');
    }
};
