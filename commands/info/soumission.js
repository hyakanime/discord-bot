const { EmbedBuilder } = require("discord.js");
module.exports = {
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: "🖼️ Soumission d'animes" })
      .setColor("#196ffa")
      .setDescription(`Hyakanime permet la soumission d'animes afin d'enrichir sa base de données, grâce à la participation de la communauté.\n`)
    .addFields(
        {
          name: "• Ajout d'un nouvel anime",
          value: `Pour ajouter un nouvel anime, rendez-vous sur le lien suivant : [Ajouter un nouvel anime](https://hyakanime.fr/new/anime).`,
          inline: false,
        },
        {
          name: "• Modifier une données d'un anime",
          value:
            `Pour modifier une donnée concernant un anime, cliquez sur l'anime en question, puis sur "Modifier la page".`,
          inline: false,
        },
        {
          name: "• Manuel",
          value:
            "Pour vous aider, voici le manuel qui reprend les règles d'édition et d'ajout : [Lien vers le manuel](https://hyakanime.notion.site/Manuel-Hyakanime-0c17cf3d80cf4d1092a8e17f1679cef6).",
          inline: false,
        },
        {
          name: "\u200b",
          value:
            "Si vous avez des questions, n'hésitez pas à demander aux moderateurs.\n\nVeuillez noter que les soumissions sur l'application ne sont pas possibles. Vous devrez passer par la version web.",
          inline: false,
        }
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
