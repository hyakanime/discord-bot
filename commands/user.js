const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require("discord.js");
const { urlEndpoint } = require("../config.json");
const { fetchUserData, buildUserPage, PAGES } = require("../function/user.js");
const UserEmbedCache = require('../models/UserEmbedCache');
let timeoutId;

async function getFromCache(pseudo) {
  try {
    const cachedResult = await UserEmbedCache.findOne({ pseudo, expiresAt: { $gt: new Date() } });
    return cachedResult?.userData ? cachedResult.userData : null;
  } catch (error) {
    console.error('Erreur lors de la récupération du cache:', error);
    return null;
  }
}

async function addToCache(pseudo, userData) {
  try {
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 1);
    await UserEmbedCache.updateOne({ pseudo }, { pseudo, userData, expiresAt }, { upsert: true });
  } catch (error) {
    console.error('Erreur lors de l\'ajout au cache:', error);
  }
}

// Construit la rangée contenant le menu déroulant des pages de statistiques.
function buildSelectRow(activePageId, disabled = false) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('user_stats_select')
    .setPlaceholder('Choisis une catégorie de statistiques')
    .setDisabled(disabled)
    .addOptions(PAGES.map(page => ({
      label: page.label,
      description: page.description,
      value: page.id,
      emoji: page.emoji,
      default: page.id === activePageId,
    })));
  return new ActionRowBuilder().addComponents(menu);
}

module.exports = {
  data: new SlashCommandBuilder().setName("user").setDescription("Fournit des informations sur l'utilisateur.")
    .addStringOption(option => option.setName("pseudo").setDescription("Votre pseudo Hyakanime")
      .setAutocomplete(true).setRequired(true)),

  async autocomplete(interaction) {
    const pseudo = interaction.options.getFocused() || "te";
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const response = await fetch(urlEndpoint + "/search/user/" + pseudo), data = await response.text(), result = JSON.parse(data), choices = [];
      for (let i = 0; i < result.length && i <= 10; i++) {
        if (result[i] == undefined) return;
        choices.push({ username: result[i].username, uid: result[i].uid });
      }
      await interaction.respond(choices.map(choice => ({ name: choice.username, value: `${choice.username}` })));
    }, 300);
  },

  async execute(interaction) {
    await interaction.deferReply();
    const pseudo = interaction.options.getString("pseudo");
    if (!pseudo || pseudo === "") return await interaction.editReply("Erreur lors de la récupération du compte");

    try {
      let userData = await getFromCache(pseudo);
      if (!userData) {
        userData = await fetchUserData(pseudo);
        if (!userData) return await interaction.editReply("Erreur lors de la récupération du compte");
        await addToCache(pseudo, userData);
      }

      let activePage = 'overview';
      const { embed, attachment } = await buildUserPage(activePage, userData, { EmbedBuilder, AttachmentBuilder });
      const message = await interaction.editReply({ embeds: [embed], files: [attachment], components: [buildSelectRow(activePage)] });

      const collector = message.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: 5 * 60 * 1000 });

      collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
          return await i.reply({ content: "Ce menu n'est pas le tien. Lance ta propre commande /user.", flags: 64 });
        }
        activePage = i.values[0];
        const page = await buildUserPage(activePage, userData, { EmbedBuilder, AttachmentBuilder });
        await i.update({ embeds: [page.embed], files: [page.attachment], components: [buildSelectRow(activePage)] });
      });

      collector.on('end', async () => {
        try { await interaction.editReply({ components: [buildSelectRow(activePage, true)] }); } catch (e) { /* message supprimé ou expiré */ }
      });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      await interaction.editReply("Une erreur est survenue lors de la recherche.");
    }
  },
  UserEmbedCache
};
