const { SlashCommandBuilder} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Supprime X messages (max 100)")
    .addStringOption((option) =>
      option
        .setName("nombre")
        .setRequired(true)
        .setDescription("Le nombre de messages déstiné a être supprimé")
    ),
  async execute(interaction) {
    if (
      interaction.user.id == "266172334010925056" ||
      interaction.user.id == "245604480278593537" 
    ) {
      var nombre = interaction.options.get("nombre").value;
      if (nombre > 100) {
        interaction.reply({
          content: "Merci de mettre un nombre en dessous de 100",
          ephemeral: true,
        });
      } else {
        try {
          await interaction.channel.bulkDelete(nombre);
          interaction.reply({
            content: nombre + " messages supprimés !",
            ephemeral: true,
          });
        } catch (e) {
          interaction.reply({
            content:
              "Vous ne pouvez pas supprimer les messages datant maximum de 14 jours",
            ephemeral: true,
          });
        }
      }
    } else {
      interaction.reply({
        content: "Vous n'avez pas les permissions pour effectuer la commande",
        ephemeral: true,
      });
    }
  },
};
