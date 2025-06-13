const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("down")
    .setDescription("Plus rien ne marche ? Informez tout le monde comme ça !"),
  async execute(interaction) {
    const embed3 = new EmbedBuilder()
      .setAuthor({ name: "📵 Le serveur Hyakanime est down" })
      .setColor("#196ffa")
      .setDescription(
        "Tout ou une partie des services Hyakanime ne sont pas accessibles momentanément."
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed3] });
  },
};
