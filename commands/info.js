const { SlashCommandBuilder } = require('discord.js');

// Importer dynamiquement les sous-commandes
const subcommands = {
    pageblanche: require('./info/pageblanche'),
    embed: require('./info/embed'),
    down: require('./info/down'),
    streaming: require('./info/streaming'),
    soumission: require('./info/soumission'),
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Commande servant à fournir diverses informations')
        .addSubcommand(subcommand =>
            subcommand
                .setName('pageblanche')
                .setDescription('Explication sur les pages blanche'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed')
                .setDescription('Explication sur le raffraichissement des images présentes dans les embeds.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('down')
                .setDescription('Plus rien ne marche ? Informez tout le monde comme ça !'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('streaming')
                .setDescription('Explication sur le lien entre Hyakanime et le streaming.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('soumission')
                .setDescription('Explication sur la soumission de fiche anime.')),
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();

        // Vérifie si la sous-commande existe dans l'objet subcommands
        if (subcommands[subCommand]) {
            try {
                await subcommands[subCommand].execute(interaction);
            } catch (error) {
                console.error(`Erreur lors de l'exécution de la sous-commande ${subCommand}:`, error);
                await interaction.reply({ content: 'Une erreur est survenue lors de l\'exécution de cette sous-commande.', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Sous-commande non reconnue.', ephemeral: true });
        }
    },
};
