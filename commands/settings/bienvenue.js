module.exports = async function(interaction, settings) {
    const enable = interaction.options.getBoolean('enable');
    const channel = interaction.options.getChannel('channel');

    if (enable !== null) {
        settings.welcomeEnabled = enable;
    }

    if (channel) {
        if (channel.guildId !== interaction.guildId) {
            await interaction.editReply('❌ Erreur: Le canal spécifié ne fait pas partie de ce serveur.');
            return;
        }
        settings.welcomeChannelId = channel.id;
    } else if (interaction.options.get('channel') !== null) {
        settings.welcomeChannelId = undefined;
    }

    if (settings.welcomeEnabled && !settings.welcomeChannelId) {
        await interaction.editReply('⚠️ Attention: La bienvenue est activée mais aucun canal n\'est spécifié. Les messages de bienvenue ne seront pas envoyés.');
    }
};
