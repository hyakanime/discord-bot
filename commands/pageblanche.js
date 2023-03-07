const { SlashCommandBuilder,EmbedBuilder} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder().setName("pageblanche").setDescription(
    "Explication sur les pages blanche."
  ),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: "📄 Page Blanche" })
      .setColor("#196ffa")
      .setDescription(
        "Les pages blanches sur le site peuvent apparaître à la suite de nombreuses causes:"
      )
      .addFields(
        {
          name: "• Bloqueur de publicité (AdBlock)",
          value: `Désactivez votre bloqueur de publicité (et soutenez Hyakanime).`,
          inline: false,
        },
        {
          name: "• Cache du site internet",
          value:
            "Pour actualiser le cache du site, rendez-vous sur https://hyakanime.fr et appuyez simultanément sur `CTRL + F5`",
          inline: false,
        },
        {
          name: "\u200b",
          value:
            "Si le souci persiste, n'hésitez pas à mentionner <@245604480278593537>",
          inline: false,
        }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
