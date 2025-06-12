const { EmbedBuilder } = require('discord.js');
const { tokenHyakanime } = require("../config.json");

let lastStatus = null;
let consecutiveRejections = 0;

async function embedEdit(client, channelId) {
    if (!client?.channels || !channelId) return;

    try {
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
            }
        }
    } catch (error) {
        console.error('Erreur:', error.message);
    }
}

module.exports = { embedEdit };
