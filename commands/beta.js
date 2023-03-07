const { Partials, Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder,SlashCommandBuilder} = require("discord.js");
const {roleBeta, channelBeta} = require('../config.json');
const client = new Client({ intents:[
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildBans,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildMembers,
]
});

module.exports = {
  data: new SlashCommandBuilder()
    .setName("beta")
    .setDescription("Inscription à la bêta de l'application")
    .addStringOption((option) =>
      option
        .setName("email")
        .setDescription("Email associé à votre compte Apple ou Google")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("système")
        .setDescription("OS de votre téléphone")
        .setRequired(true)
        .addChoices(
          { name: "iOS", value: "iOS" },
          { name: "Android", value: "Android" }
        )
    ),

  async execute(interaction, message) {
    
    var email = interaction.options.get("email").value;
    var system = interaction.options.get("système").value;
    if (/^[a-zA-Z0-9_.]+@[a-zA-Z0-9]+\.[a-zA-Z]{1,3}$/.test(email)) {
      role = interaction.guild.roles.cache.find((role) => role.id == roleBeta);
      await interaction.member.roles.add(role);

      const embedBeta = new EmbedBuilder()
        .setAuthor({
          name: "Vous êtes maintenant inscrit pour tester les version bêta de Hyakanime !",
        })
        .addFields(
          {
            name: "\u200b",
            value: "Vous venez de recevoir le rôle <@&1036572391201054730>.",
            inline: false,
          },
          {
            name: "\u200b",
            value:
              "Rappel : En participant aux tests de l'application, vous accepter de rencontrer des bugs et de les faire remonter.",
            inline: false,
          }
        )
        .setColor("#3d67ff");

      const embedbetaAdmin = new EmbedBuilder()
        .setAuthor({ name: `Inscription de <@${interaction.member.id}>` })
        .addFields(
          { name: "Plateforme", value: system, inline: false },
          { name: "email", value: email, inline: false }
        )
        .setColor("#3d67ff");

        client.channels.cache.get(channelBeta).send({ content: '', embeds: [embedbetaAdmin] })


      await interaction.reply({
        content: "",
        embeds: [embedBeta],
        ephemeral: true,
      });
    } else {
      interaction.reply({
        content: "Format de l'email invalide",
        ephemeral: true,
      });
    }
  },
}; //ReferenceError: Client is not defined
