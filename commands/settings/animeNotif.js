module.exports = async function(interaction, settings) {
    const enable = interaction.options.getBoolean('enable');
    const channel = interaction.options.getChannel('channel');

    if (enable !== null) {
        settings.animeNotifEnabled = enable;
    }

    if (channel) {
        if (channel.guildId !== interaction.guildId) {
            await interaction.editReply('❌ Erreur: Le canal spécifié ne fait pas partie de ce serveur.');
            return;
        }
        settings.animeNotifChannelId = channel.id;
    } else if (interaction.options.get('channel') !== null) {
        settings.animeNotifChannelId = undefined;
    }
};
