const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require("discord.js");
const fetch = require("node-fetch");
const { urlEndpoint, logoUrl } = require("../config.json");
const { fetchUser } = require("../function/user.js");
let timeoutId;
module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Fournit des informations sur l’utilisateur.")
    .addStringOption((option) =>
      option
        .setName("pseudo")
        .setDescription(
          "Votre pseudo Hyakanime"
        )
        .setAutocomplete(true)
        .setRequired(true)
    ),
  async autocomplete(interaction) {
    const pseudo = interaction.options.getFocused() || "te"; //le "te" est juste là pour avoir un résultat
    clearTimeout(timeoutId);
        timeoutId = setTimeout(async() => {
    const response = await fetch(urlEndpoint + "/search/user/" + pseudo);
    const data = await response.text();
    const result = JSON.parse(data);
    const choices = [];

    for (let i = 0; i < result.length && i <= 10; i++) {
      if (result[i] == undefined) return;
      choices.push({
        username: result[i].username,
        uid: result[i].uid,
      });
    }
    await interaction.respond(
      choices.map(choice => ({ name: choice.username, value: `${choice.uid}` })),
    );
  }
  , 300);
  },
  async execute(interaction) {
    await interaction.deferReply();
    var pseudo = interaction.options.getString("pseudo");
    if (pseudo == undefined) {
      await interaction.editReply("Erreur lors de la récupération du compte");
      return;
    } else if (pseudo == "") {
      await interaction.editReply("Erreur lors de la récupération du compte");
      return;
    }
    const { userEmbed, attachment } = await fetchUser(pseudo, EmbedBuilder, AttachmentBuilder);
    if (userEmbed == null) {
      await interaction.editReply("Erreur lors de la récupération du compte");
      return;
    }
    await interaction.editReply({ embeds: [userEmbed], files: [attachment] });
  }
}
