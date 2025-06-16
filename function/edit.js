const { EmbedBuilder } = require('discord.js');
const { tokenHyakanime } = require("../config.json");
const fs = require('fs');
const path = require('path');

let lastStatus = null;
let consecutiveRejections = 0;

function readStatusFromFile() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'status.json'), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Si le fichier n'existe pas ou qu'il y a une erreur, retourner null
        return null;
    }
}

function writeStatusToFile(status) {
    const data = JSON.stringify({ lastStatus: status });
    fs.writeFileSync(path.join(__dirname, 'status.json'), data, 'utf8');
}

async function embedEdit(client, channelId) {
    if (!client?.channels || !channelId) return;

    try {
        // Lire le dernier statut depuis le fichier JSON
        const statusData = readStatusFromFile();
        if (statusData) {
            lastStatus = statusData.lastStatus;
        }

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
                // Écrire le nouveau statut dans le fichier JSON
                writeStatusToFile(lastStatus);
            }
        }
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

module.exports = { embedEdit };
