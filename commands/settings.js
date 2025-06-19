// commands/settings/settings.js
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const GuildSettings = require('../models/GuildSettings');

// Importer dynamiquement les sous-commandes avec les chemins corrects
const subcommands = {
    view: require('./settings/view'),
    welcome: require('./settings/bienvenue'),
    embedlink: require('./settings/embedlink'),
    editalert: require('./settings/editalert'),
    reset: require('./settings/reset'),
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('settings')
        .setDescription('Configure les paramètres du serveur')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .addSubcommand(subcommand =>
            subcommand.setName('view')
                .setDescription('Afficher les paramètres actuels du serveur'))
        .addSubcommand(subcommand =>
            subcommand.setName('bienvenue')
                .setDescription('Configurer les paramètres de bienvenue')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('Activer ou désactiver la bienvenue')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Le canal pour les messages de bienvenue')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('embedlink')
                .setDescription('Configurer les paramètres de l\'embed de lien Hyakanime')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('Activer ou désactiver l\'embed de lien Hyakanime')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('editalert')
                .setDescription('Configurer les paramètres d\'alerte d\'édition')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('Activer ou désactiver les alertes d\'édition')
                        .setRequired(false))
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('Le canal pour les alertes d\'édition')
                        .addChannelTypes(ChannelType.GuildText)
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand.setName('reset')
                .setDescription('Réinitialiser tous les paramètres à leurs valeurs par défaut')
                .addBooleanOption(option =>
                    option.setName('confirm')
                        .setDescription('Confirmer la réinitialisation')
                        .setRequired(true))),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const subCommand = interaction.options.getSubcommand();
        const guildId = interaction.guildId;

        try {
            let settings = await GuildSettings.findOne({ guildId: guildId });
            if (!settings) {
                settings = new GuildSettings({
                    guildId: guildId,
                    guildName: interaction.guild.name
                });
            }

            if (subcommands[subCommand]) {
                await subcommands[subCommand](interaction, settings); // Appel direct de la fonction

                if (subCommand !== 'view') {
                    await settings.save();
                    if (subCommand !== 'reset') {
                        await interaction.editReply('Paramètres mis à jour avec succès !');
                    }
                }
            } else {
                await interaction.editReply('Sous-commande non reconnue.');
            }
        } catch (error) {
            console.error(`Erreur lors de l'exécution de la sous-commande ${subCommand}:`, error);
            await interaction.followUp('Une erreur est survenue lors de la mise à jour des paramètres.');
        }
    },
};
