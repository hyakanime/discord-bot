const { SlashCommandBuilder } = require("discord.js");
const { urlEndpoint } = require("../config.json");
const UserLink = require('../models/UserLink.js');
let timeoutId;

// La recherche renvoie tous les pseudos *contenant* la chaîne : pour "Julien" elle
// renvoie aussi "JulienToutain", "JulienBarbier"… On ne retient donc QUE la
// correspondance exacte (insensible à la casse). Sans correspondance exacte on
// renvoie null : lier un pseudo approximatif au premier résultat venu produit de
// mauvaises liaisons et un message de succès trompeur.
function pickBestMatch(results, pseudo) {
  if (!Array.isArray(results)) return null;
  const wanted = String(pseudo).toLowerCase();
  return results.find(u => u && typeof u.username === 'string' && u.username.toLowerCase() === wanted) || null;
}

async function checkHyakanimeUserExists(pseudo) {
  try {
    const response = await fetch(`${urlEndpoint}/search/user/${encodeURIComponent(pseudo)}`);
    if (!response.ok) return { exists: false };
    const result = JSON.parse(await response.text());
    const match = pickBestMatch(result, pseudo);
    if (match) {
      return {
        exists: true,
        uid: match.uid,
        username: match.username
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

      // On stocke et on affiche le pseudo canonique résolu (userCheck.username),
      // pas la chaîne tapée par l'utilisateur, pour éviter tout affichage trompeur.
      if (existingLink) {
        existingLink.hyakanimePseudo = userCheck.username;
        existingLink.hyakanimeUid = userCheck.uid;
        existingLink.discordUsername = discordUsername;
        await existingLink.save();
        await interaction.editReply(`Ton compte Discord a été mis à jour avec le nouveau pseudo Hyakanime: ${userCheck.username}`);
      } else {
        const newLink = new UserLink({
          discordId,
          discordUsername,
          hyakanimePseudo: userCheck.username,
          hyakanimeUid: userCheck.uid
        });
        await newLink.save();
        await interaction.editReply(`Ton compte Discord a été lié avec succès à ton compte Hyakanime (${userCheck.username})!`);
      }
    } catch (error) {
      console.error('Erreur lors de la liaison des comptes:', error);
      await interaction.editReply('Une erreur est survenue lors de la liaison de ton compte. Veuillez réessayer plus tard.');
    }
  },

  // exporté pour les tests unitaires
  pickBestMatch
};
