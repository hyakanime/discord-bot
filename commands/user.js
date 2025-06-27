const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const { urlEndpoint } = require("../config.json");
const { fetchUser } = require("../function/user.js");
const UserEmbedCache = require('../models/UserEmbedCache');
let timeoutId;


async function getFromCache(pseudo) {
  try {
    const now = new Date(), cachedResult = await UserEmbedCache.findOne({ pseudo, expiresAt: { $gt: now } });
    if (cachedResult) return { userEmbed: new EmbedBuilder(cachedResult.userEmbed), attachment: new AttachmentBuilder(cachedResult.attachment, { name: cachedResult.attachmentName }) };
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du cache:', error);
    return null;
  }
}

async function addToCache(pseudo, userEmbed, attachment) {
  try {
    const expiresAt = new Date(); expiresAt.setDate(expiresAt.getDate() + 1);
    const embedData = userEmbed.toJSON();
    const attachmentBuffer = attachment.attachment instanceof Buffer ? attachment.attachment : Buffer.from(attachment.attachment);
    await UserEmbedCache.updateOne({ pseudo }, {
      pseudo, userEmbed: embedData, attachment: attachmentBuffer,
      attachmentName: attachment.name || 'image.png', expiresAt
    }, { upsert: true });
  } catch (error) {
    console.error('Erreur lors de l\'ajout au cache:', error);
  }
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
      const cachedData = await getFromCache(pseudo);
      if (cachedData) return await interaction.editReply({ embeds: [cachedData.userEmbed], files: [cachedData.attachment] });

      const { userEmbed, attachment } = await fetchUser(pseudo, EmbedBuilder, AttachmentBuilder);
      if (!userEmbed) return await interaction.editReply("Erreur lors de la récupération du compte");

      await addToCache(pseudo, userEmbed, attachment);
      await interaction.editReply({ embeds: [userEmbed], files: [attachment] });
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      await interaction.editReply("Une erreur est survenue lors de la recherche.");
    }
  },
  UserEmbedCache
};
