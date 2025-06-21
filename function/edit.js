const { EmbedBuilder } = require('discord.js');
const { tokenHyakanime } = require("../config.json");
const mongoose = require('mongoose');
const GuildSettings = require('../models/GuildSettings');

// Définir le modèle Status
const statusSchema = new mongoose.Schema({
  lastStatus: {
    type: Boolean,
    required: true
  },
  consecutiveRejections: {
    type: Number,
    default: 0
  }
});

const Status = mongoose.model('Status', statusSchema);

let lastStatus = null;
let consecutiveRejections = 0;

async function readStatusFromDB() {
    try {
        const status = await Status.findOne();
        if (status) {
            lastStatus = status.lastStatus;
            consecutiveRejections = status.consecutiveRejections;
        }
        return status;
    } catch (error) {
        console.error('Erreur lors de la lecture du statut depuis la base de données:', error);
        return null;
    }
}

async function writeStatusToDB(status, consecutiveRejections) {
    try {
        await Status.updateOne(
            {},
            { lastStatus: status, consecutiveRejections: consecutiveRejections },
            { upsert: true }
        );
    } catch (error) {
        console.error(`Erreur lors de l'écriture du statut dans la base de données:`, error);
    }
}

async function embedEdit(client) {
    if (!client?.channels) return;

    try {
        // Lire le dernier statut depuis la base de données
        await readStatusFromDB();

        const response = await fetch("https://api-v3.hyakanime.fr/auth/refresh", {
            headers: { authorization: `Token ${tokenHyakanime}` },
            method: "POST"
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const data = await response.json();
        const isAccepted = data.isSubmissionAccepted || false;

        if (lastStatus !== isAccepted || (!isAccepted && !(consecutiveRejections % 24))) {
            // Créer l'embed
            const alertEmbed = new EmbedBuilder()
                .setColor(isAccepted ? 0x00FF00 : 0xFF0000)
                .setTitle(isAccepted ? '✅ Demandes réouvertes' : '⚠️ Demandes fermées temporairement')
                .setDescription(isAccepted ?
                    `L'édition et l'ajout sont de retour` :
                    'En raison d’un grand nombre de demandes en cours, l’édition et l’ajout sont momentanément fermés.')
                .setTimestamp();

            // Récupérer tous les serveurs avec editAlertEnabled = true
            const enabledGuilds = await GuildSettings.find({
                editAlertEnabled: true,
                editAlertChannelId: { $exists: true, $ne: null }
            });

            // Envoyer l'alerte à chaque serveur configuré
            for (const guildSettings of enabledGuilds) {
                try {
                    const channel = await client.channels.fetch(guildSettings.editAlertChannelId);
                    if (channel && channel.isTextBased()) {
                        await channel.send({ embeds: [alertEmbed] });
                        console.log(`Notification envoyée dans le canal ${channel.name} (${guildSettings.guildId})`);
                    } else {
                        console.log(`Canal introuvable ou invalide pour le serveur ${guildSettings.guildId}`);
                    }
                } catch (error) {
                    console.error(`Erreur lors de l'envoi de la notification au serveur ${guildSettings.guildId}:`, error.message);
                }
            }

            // Mise à jour du statut
            if (!isAccepted && !(consecutiveRejections % 24)) {
                consecutiveRejections = 0;
            }
            lastStatus = isAccepted;

            // Écrire le nouveau statut dans la base de données
            await writeStatusToDB(lastStatus, consecutiveRejections);
        }
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

module.exports = { embedEdit };
