const { EmbedBuilder } = require("discord.js");
module.exports = {
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setAuthor({ name: "📱 Streaming" })
      .setColor("#f4cccc")
      .setDescription(
        `Hyakanime n'est pas une application de streaming vidéo d'animes. Il est une alternative a des applications ou site comme Anilist, MyAnimeList... \n Il ne seras **JAMAIS** possible de regarder des animes ilégalement sur l'application.`
      )
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  },
};
