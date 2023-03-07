const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("amazon")
    .setDescription("Créer un lien d'affiliation avec Amazon")
    .addStringOption((option) =>
      option
        .setName("lien")
        .setDescription(
          "Exemple: https://www.amazon.fr/Calendrier-2023-Chainsaw-Man-XXX/dp/2820345018"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    var url = interaction.options.get("lien").value;
    if (url.indexOf("http") >= 0 && url.indexOf(".") >= 0) {
      var urlFinal = "";
      var index = url.indexOf("tag");
      if (url.indexOf("tag") != -1) {
        url = url.substr(0, index);
      }
      var pays = url.substr(url.indexOf("amazon") + 7, 2);
      switch (pays) {
        case "fr":
          urlFinal = url + "&tag=hyakanime03-21";
          break;
        case "it":
          urlFinal = url + "&tag=hyakanime0b-21";
          break;
        case "es":
          urlFinal = url + "&tag=hyakanime05-21";
          break;
        case "de":
          urlFinal = url + "&tag=hyakanime07-21";
          break;
        case "uk":
          urlFinal = url + "&tag=hyakanime095-21";
          break;
        default:
          urlFinal = url + "&tag=hyakanime03-21";
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
