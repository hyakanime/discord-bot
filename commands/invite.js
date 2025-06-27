const { SlashCommandBuilder, EmbedBuilder} = require("discord.js");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Génere un lien d'invitation pour le bot"),
  async execute(interaction) {
    const clientId = interaction.client.user.id;
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle("Invite le bot sur ton serveur")
      .setDescription(`Clique sur le lien ci-dessous pour inviter le bot sur ton serveur Discord.`)
      .addFields({ name: "Lien d'invitation", value: `[Inviter le bot](https://discord.com/oauth2/authorize?client_id=${clientId})` })
      .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: 64 }); //64 = flag Ephemeral
  },
};