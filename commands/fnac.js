const { SlashCommandBuilder } = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("fnac")
    .setDescription("Créer un lien d'affiliation avec la FNAC")
    .addStringOption((option) =>
      option
        .setName("lien")
        .setDescription(
          "Exemple: https://livre.fnac.com/a14859038/Spy-x-Family-Tome-1-Spy-x-Family-Tatsuya-Endo"
        )
        .setRequired(true)
    ),

  async execute(interaction) {
    var url = interaction.options.get("lien").value;
    if (url.indexOf("http") >= 0 && url.indexOf(".") >= 0) {
      var urlFinal = "";
      var index = url.indexOf("#");
      if (index === -1) {
        urlFinal =
          "https://www.awin1.com/cread.php?awinmid=12665&awinaffid=1068391&ued=" +
          url;
      } else {
        urlFinal =
          "https://www.awin1.com/cread.php?awinmid=12665&awinaffid=1068391&ued=" +
          url.substr(0, index);
      }

      await interaction.reply({
        content:
          "Voici le lien affilié \n" +
          urlFinal +
          "\nMerci de soutenir Hyakanime 💙",
        ephemeral: true,
      });
    } else {
      interaction.reply({ content: "Format d'url invalide", ephemeral: true });
    }
  },
};
