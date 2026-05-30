const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { urlEndpoint, applicationId, token } = require("../../config.json");
let timeoutId;


module.exports = {
  async execute(interaction) {
    await interaction.reply({content: "Configuration du widget en cours...", flags: 64});
    const pseudo = interaction.options.getString("pseudo");
    if (!pseudo || pseudo === "") return await interaction.editReply("Erreur lors de la récupération du compte");

    try {
        const response = await fetch(urlEndpoint + "/user/" + pseudo);
        const data = await response.text();
        let result = JSON.parse(data);
        if (result?.message) {
          const response2 = await fetch(urlEndpoint + "/search/user/" + pseudo);
          const data2 = await response2.text();
          const result2 = JSON.parse(data2);

          if (result2.length == 0) {
             throw new Error("Aucun utilisateur trouvé avec ce pseudo.");
          } else {
            result = result2[0];
          }
        };
            console.log("Envoi de la requête à Discord avec le payload suivant :");

        const response2 = await fetch(urlEndpoint + "/progression/anime/stats/status/" + result.uid);
        const statsHyak = await response2.json();
        const stats = {
            Planning: statsHyak["2"] || 0,
            Paused: statsHyak["4"] || 0,
            Watching: statsHyak["1"] || 0,
            Completed: statsHyak["3"] || 0,
            dropped: statsHyak["5"] || 0,
            all: statsHyak["total"] || 0,
        };

        const dynamicData = [
                {
                    "type": 3,
                    "name": "profil_picture",
                    "value": {
                    "url": result.photoURL
                    }
                },
                {
                    "type": 1,
                    "name": "user_name",
                    "value": result.username
                },
                {
                    "type": 1,
                    "name": "completed_number",
                    "value": stats.Completed.toString()
                },
                {
                    "type": 1,
                    "name": "planning_number",
                    "value": stats.Planning.toString()
                },
                {
                    "type": 1,
                    "name": "watching_number",
                    "value": stats.Watching.toString()
                },
                {
                    "type": 1,
                    "name": "all_number",
                    "value": stats.all.toString()
                },
                {
                    "type": 1,
                    "name": "paused",
                    "value": stats.Paused.toString()
                },
                {
                    "type": 1,
                    "name": "dropped_number",
                    "value": stats.dropped.toString()
                }
            ]

            const payload = {
            username: result.username,
            data: {
                dynamic: dynamicData
            }
        };
            var url = `https://discord.com/api/v9/applications/${applicationId}/users/${interaction.user.id}/identities/0/profile`;
            console.log(interaction.user.id);
            console.log("Payload envoyé à Discord : ", payload);
            console.log("data dynamique : ", payload.data.dynamic);

            const discordResponse = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bot ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!discordResponse.ok) {
            const errorText = await discordResponse.text();
            throw new Error(`Discord API error: ${errorText}`);
        }
        console.log(discordResponse)
        console.log("Widget configuré avec succès pour l'utilisateur :", result.username);
        await interaction.editReply({ content: `Le widget Hyakanime pour **${result.username}** a bien été configuré sur votre profil ! Vous pouvez l'ajouter dans votre profil Discord.`, flags: 64 });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      await interaction.editReply({ content: "Une erreur est survenue lors de l'ajout du profil.", flags: 64 });
    }
  }
};
