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
    if (url.startsWith("http") && url.includes(".")) {
      const tagIndex = url.indexOf("tag");
      const baseUrl = tagIndex !== -1 ? url.substring(0, tagIndex) : url;
      const countryCodeIndex = baseUrl.indexOf("amazon.") + 7;
      const countryCode = baseUrl.substr(countryCodeIndex, 2);

      const tags = {
        fr: "hyakanime03-21",
        it: "hyakanime0b-21",
        es: "hyakanime05-21",
        de: "hyakanime07-21",
        uk: "hyakanime095-21",
      };

      const tag = tags[countryCode] || "hyakanime03-21";
      const urlFinal = `${baseUrl}&tag=${tag}`;

      await interaction.reply({
        content:
          "Voici le lien affilié \n" +
          urlFinal +
          "\nMerci de soutenir Hyakanime 💙",
        flags: 64,
      });
    } else {
      interaction.reply({ content: "Format d'url invalide", flags: 64 });
    }
  },
};
