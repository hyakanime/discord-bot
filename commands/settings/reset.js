module.exports = async function(interaction, settings) {
    const confirm = interaction.options.getBoolean('confirm');
    if (!confirm) {
        await interaction.editReply('Réinitialisation annulée.');
        return;
    }

    settings.welcomeEnabled = false;
    settings.welcomeChannelId = undefined;
    settings.hyakanimeLinkEmbedEnabled = false;
    settings.editAlertEnabled = false;
    settings.editAlertChannelId = undefined;

    await settings.save();
    await interaction.editReply('Tous les paramètres ont été réinitialisés à leurs valeurs par défaut.');
};
