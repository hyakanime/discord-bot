const { SlashCommandBuilder } = require("discord.js");
const { urlEndpoint } = require("../config.json");
const UserLink = require('../models/UserLink.js');
let timeoutId;

async function checkHyakanimeUserExists(pseudo) {
  try {
    const response = await fetch(`${urlEndpoint}/search/user/${encodeURIComponent(pseudo)}`);
    if (!response.ok) return { exists: false };
    const result = JSON.parse(await response.text());
    if (result.length > 0) {
      return {
        exists: true,
        uid: result[0].uid,
        username: result[0].username
      };
    }
    return { exists: false };
  } catch (error) {
    console.error('Erreur lors de la vérification du pseudo Hyakanime:', error);
    return { exists: false };
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("link")
    .setDescription("Lie ton compte Discord à ton compte Hyakanime")
    .addStringOption(option => option.setName("pseudo")
      .setDescription("Votre pseudo Hyakanime")
      .setAutocomplete(true)
      .setRequired(true)),

  async autocomplete(interaction) {
    const pseudo = interaction.options.getFocused() || "te";
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(urlEndpoint + "/search/user/" + pseudo);
        const result = JSON.parse(await response.text());
        const choices = result.slice(0, 10).filter(user => user).map(user => ({
          name: user.username,
          value: user.username
        }));
        await interaction.respond(choices);
      } catch (error) {
        console.error('Erreur lors de l\'autocomplétion:', error);
        await interaction.respond([]);
      }
    }, 300);
  },

  async execute(interaction) {
    await interaction.deferReply({ flags: 64 });
    const hyakanimePseudo = interaction.options.getString("pseudo");
    const discordUser = interaction.user;
    const discordId = discordUser.id;
    const discordUsername = discordUser.username || discordUser.globalName || discordUser.tag;

    try {
      const userCheck = await checkHyakanimeUserExists(hyakanimePseudo);

      if (!userCheck.exists) {
        return await interaction.editReply(`Le pseudo Hyakanime "${hyakanimePseudo}" n'existe pas ou n'a pas été trouvé.`);
      }

      const existingLink = await UserLink.findOne({ discordId });

      if (existingLink) {
        existingLink.hyakanimePseudo = hyakanimePseudo;
        existingLink.hyakanimeUid = userCheck.uid;
        existingLink.discordUsername = discordUsername;
        await existingLink.save();
        await interaction.editReply(`Ton compte Discord a été mis à jour avec le nouveau pseudo Hyakanime: ${hyakanimePseudo}`);
      } else {
        const newLink = new UserLink({
          discordId,
          discordUsername,
          hyakanimePseudo,
          hyakanimeUid: userCheck.uid
        });
        await newLink.save();
        await interaction.editReply(`Ton compte Discord a été lié avec succès à ton compte Hyakanime (${hyakanimePseudo})!`);
      }
    } catch (error) {
      console.error('Erreur lors de la liaison des comptes:', error);
      await interaction.editReply('Une erreur est survenue lors de la liaison de ton compte. Veuillez réessayer plus tard.');
    }
  }
};
