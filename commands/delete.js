const { SlashCommandBuilder, PermissionFlagsBits} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Supprime X messages (max 100)")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addNumberOption((option) =>
      option
        .setName("nombre")
        .setRequired(true)
        .setDescription("Le nombre de messages déstiné a être supprimé")
        .setMaxValue(100)
    ),
  async execute(interaction) {
    var nombre = interaction.options.get("nombre").value;
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
};
