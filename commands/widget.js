const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require("discord.js");
const {logoUrl, urlEndpoint, oauth2} = require("../config.json");
const diffuseurEmoji = require("../diffuseurEmoji.json");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("widget")
        .setDescription("Commande pour avoir le widget Hyak sur son profil discord."),
    async execute(interaction) {
        const button = new ButtonBuilder()
            .setLabel("Accéder au widget")
            .setURL(oauth2)
            .setStyle(ButtonStyle.Link);
        const embed = new EmbedBuilder()
            .setTitle("Widget Hyak")
            .setDescription("Clique sur le bouton ci-dessous pour accéder au widget Hyak. Le widget est affiché que sur ordinateur/navigateur. \n\nQuand vous aurez accepté le widget, il faut faire la commande /widget-setup")
            .setThumbnail(logoUrl);
        const row = new ActionRowBuilder().addComponents(button);

        await interaction.reply({ embeds: [embed], components: [row], flags: 64});
    }
};

const subcommands = {
    refresh: require('./widget/refresh'),
    setup: require('./widget/setup')
};

let timeoutId;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('widget')
        .setDescription('Commande permettant d\'avoir le widget Hyak sur son profil discord.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('Commande pour configurer le widget Hyak sur son profil discord.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('refresh')
                .setDescription('Commande pour rafraîchir le widget Hyak sur son profil discord.')
                .addStringOption(option => option.setName("pseudo").setDescription("Votre pseudo Hyakanime")
                .setAutocomplete(true).setRequired(true))),
    async autocomplete(interaction) {
        const pseudo = interaction.options.getFocused() || "te";
        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          const response = await fetch(urlEndpoint + "/search/user/" + pseudo), data = await response.text(), result = JSON.parse(data), choices = [];
          for (let i = 0; i < result.length && i <= 10; i++) {
            if (result[i] == undefined) return;
            choices.push({ username: result[i].username, uid: result[i].uid });
          }
          await interaction.respond(choices.map(choice => ({ name: choice.username, value: `${choice.username}` })));
        }, 300);
      },
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        if (subcommands[subCommand]) {
            try {
                await subcommands[subCommand].execute(interaction);
            } catch (error) {
                console.error(`Erreur lors de l'exécution de la sous-commande ${subCommand}:`, error);
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette sous-commande.', flags: 64 });
            }
        } else {
            await interaction.reply({ content: 'Sous-commande non reconnue.', flags: 64 });
        }
    },
};
