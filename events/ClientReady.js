const { Events } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        await initializeGuildSettings(client);
    }
};

async function initializeGuildSettings(client) {
    try {
        const guilds = Array.from(client.guilds.cache.values());
        for (const guild of guilds) {
            try {
                // Vérifier si la guilde a déjà des paramètres
                const existingSettings = await GuildSettings.findOne({ guildId: guild.id });

                if (existingSettings) {
                    // Mettre à jour le nom si nécessaire
                    if (existingSettings.guildName !== guild.name) {
                        await GuildSettings.updateOne(
                            { guildId: guild.id },
                            { guildName: guild.name, updatedAt: Date.now() }
                        );
                    }
                } else {
                    // Créer de nouveaux paramètres pour cette guilde
                    const newSettings = new GuildSettings({
                        guildId: guild.id,
                        guildName: guild.name,
                        welcomeEnabled: false,
                        welcomeChannelId: null,
                        editAlertEnabled: false,
                        editAlertChannelId: null,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    });
                    await newSettings.save();
                }
            } catch (error) {
                console.error(`Erreur pour la guilde ${guild.name}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Erreur fatale lors de l\'initialisation des guildes:', error);
    }
}
