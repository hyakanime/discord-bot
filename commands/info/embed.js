const { EmbedBuilder } = require("discord.js");
module.exports = {
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: "🖼️ Embed (image sur les liens)" })
      .setColor("#196ffa")
      .setDescription(
        "Les images présentes dans les embeds de liens sont générés sur serveur dès le partage du lien en question. Suivant où le lien est partagé (Twitter, Discord..), l'image peut-être mise en cache et ne peut donc s'actualiser durant plusieurs heures ou plusieurs jours."
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
