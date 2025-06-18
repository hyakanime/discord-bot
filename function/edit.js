const { EmbedBuilder } = require('discord.js');
const { tokenHyakanime } = require("../config.json");
const mongoose = require('mongoose');

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

async function embedEdit(client, channelId) {
    if (!client?.channels || !channelId) return;

    try {
        // Lire le dernier statut depuis la base de données
        await readStatusFromDB();

        const response = await fetch("https://api-v3.hyakanime.fr/auth/refresh", {
            headers: { authorization: `Token ${tokenHyakanime}` },
            method: "POST"
        });

        if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

        const isAccepted = (await response.json()).isSubmissionAccepted || false;
        isAccepted ? consecutiveRejections = 0 : consecutiveRejections++;

        if (lastStatus !== isAccepted || (!isAccepted && !(consecutiveRejections % 24))) {
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                await channel.send({ embeds: [new EmbedBuilder()
                    .setColor(isAccepted ? 0x00FF00 : 0xFF0000)
                    .setTitle(isAccepted ? '✅ Demandes réouvertes' : '⚠️ Demandes fermées temporairement')
                    .setDescription(isAccepted ? `L'édition et l'ajout sont de retour` : 'En raison d’un grand nombre de demandes en cours, l’édition et l’ajout sont momentanément fermés.')
                    .setTimestamp()] });
                if (!isAccepted && !(consecutiveRejections % 24)) consecutiveRejections = 0;
                lastStatus = isAccepted;
                // Écrire le nouveau statut dans la base de données
                await writeStatusToDB(lastStatus, consecutiveRejections);
            }
        }
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

module.exports = { embedEdit };
