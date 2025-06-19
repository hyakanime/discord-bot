const { Events, ChannelType } = require('discord.js');
const GuildSettings = require('../models/GuildSettings'); // Adaptez le chemin selon votre structure

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        if (!guild) {
            console.error('Guild est indefini');
            return;
        }

        try {
            // Vérifier si le serveur existe déjà dans la base de données
            const existingSettings = await GuildSettings.findOne({ guildId: guild.id });

            if (!existingSettings) {
                const newGuildSettings = new GuildSettings({
                    guildId: guild.id,
                    guildName: guild.name || null,
                    // Les autres champs auront leurs valeurs par défaut définies dans le schéma
                });
                await newGuildSettings.save();
                console.log(`Paramètres par défaut enregistrés pour le serveur: ${guild.name || guild.id}`);
            } else {
                console.log(`Le serveur ${guild.name || guild.id} existe déjà dans la base de données. Mise à jour du nom si nécessaire.`);
                // Mise à jour conditionnelle du nom
                if ((guild.name && existingSettings.guildName !== guild.name) ||
                    (!guild.name && existingSettings.guildName !== null)) {
                    existingSettings.guildName = guild.name || null;
                    await existingSettings.save();
                }
            }
        } catch (error) {
            console.error(`Erreur lors de l'enregistrement des paramètres pour le serveur ${guild.name || guild.id}:`, error);
        }
    },
};
