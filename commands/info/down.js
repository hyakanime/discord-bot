const {EmbedBuilder } = require("discord.js");

module.exports = {
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: "📵 Le serveur Hyakanime est down" })
      .setColor("#196ffa")
      .setDescription(
        "Tout ou une partie des services Hyakanime ne sont pas accessibles momentanément."
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
}