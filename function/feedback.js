// function/feedback.js
const { EmbedBuilder } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');
const FeedbackState = require('../models/FeedbackState');
const { urlEndpoint } = require('../config.json');

async function checkFeedbacks(client) {
    try {
        const response = await fetch(`${urlEndpoint}/feedback?status=all`);
        const json = await response.json();

        if (!json.success || !json.data || !Array.isArray(json.data)) {
            console.error('[Feedback] Réponse API invalide:', json);
            return;
        }

        const feedbacks = json.data;
        if (feedbacks.length === 0) {
            return;
        }


        let state = await FeedbackState.findOne({ key: 'feedback' });
        
        let newFeedbacks = [];
        if (!state) {
            // Première exécution : on enregistre les 3 premiers IDs par sécurité
            const initialIds = feedbacks.slice(0, 3).map(f => f._id);
            state = new FeedbackState({ key: 'feedback', lastIds: initialIds });
            await state.save();
            return;
        }

        let lastIds = state.lastIds || [];
        
        // Rétrocompatibilité si on passe de lastId à lastIds
        if (state.lastId && lastIds.length === 0) {
            lastIds.push(state.lastId);
        }
        
        // On parcourt les feedbacks du plus récent au plus ancien
        for (const item of feedbacks) {
            if (lastIds.includes(item._id)) {
                break; // On a atteint un feedback déjà traité
            }
            newFeedbacks.push(item);
        }

        if (newFeedbacks.length === 0) {
            return;
        }

        // On inverse pour envoyer le plus ancien des "nouveaux" en premier
        newFeedbacks.reverse();

        // Récupérer toutes les guildes où l'option est activée
        const settings = await GuildSettings.find({ feedbackEnabled: true });
        
        for (const fb of newFeedbacks) {
            let description = fb.description || "Aucune description";
            if (description.length > 4000) {
                description = description.substring(0, 3997) + '...';
            }

            const embed = new EmbedBuilder()
                .setTitle(fb.title.substring(0, 256))
                .setURL(`https://hyakanime.fr/feedback/${fb.id}`)
                .setDescription(description)
                .setColor(fb.type === 'bug' ? '#FF9900' : '#00FF00'); // Orange if bug, Green if suggestion

            if (fb.user && fb.user.username) {
                embed.setAuthor({ 
                    name: fb.user.username, 
                    iconURL: fb.user.photoURL || 'https://cdn-hyakanime.s3.eu-west-3.amazonaws.com/logo-hyakanime.png'
                });
            } else {
                embed.setAuthor({
                    name: "Utilisateur Anonyme",
                    iconURL: 'https://cdn-hyakanime.s3.eu-west-3.amazonaws.com/logo-hyakanime.png'
                });
            }

            for (const guildSetting of settings) {
                if (guildSetting.feedbackChannelId) {
                    try {
                        const channel = await client.channels.fetch(guildSetting.feedbackChannelId);
                        if (channel) {
                            await channel.send({ embeds: [embed] });
                        }
                    } catch (err) {
                        console.error(`[Feedback] Erreur d'envoi pour la guilde ${guildSetting.guildId}:`, err);
                    }
                }
            }
        }

        // Mettre à jour lastIds avec les 3 plus récents de l'API (pour éviter les doublons si suppression)
        state.lastIds = feedbacks.slice(0, 3).map(f => f._id);
        await state.save();

    } catch (error) {
        console.error('[Feedback] Erreur lors de la vérification:', error);
    }
}

module.exports = {
    checkFeedbacks
};
