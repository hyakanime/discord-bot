module.exports = async function(interaction, settings) {
    const enable = interaction.options.getBoolean('enable');
    if (enable !== null) {
        settings.hyakanimeLinkEmbedEnabled = enable;
    }
};
