const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const { token } = require('./config.json');
const commands = [

    new SlashCommandBuilder()
        .setName('pageblanche')
        .setDescription('Explication sur les pages blanche.'),

    new SlashCommandBuilder()
        .setName('embed')
        .setDescription('Explication sur le raffraichissement des images présentes dans les embeds.'),

    new SlashCommandBuilder()
        .setName('down')
        .setDescription('Plus rien ne marche ? Informez tout le monde comme ça !'),

    new SlashCommandBuilder()
        .setName('avisdesastreux')
        .setDescription('Un avis posté qui est désastreux ? Voici la solution !'),


    new SlashCommandBuilder()
        .setName('amazon')
        .setDescription('Créer un lien d\'affiliation avec Amazon')
        .addStringOption(option =>
            option.setName('lien')
                .setDescription('Exemple: https://www.amazon.fr/Calendrier-2023-Chainsaw-Man-XXX/dp/2820345018')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('fnac')
        .setDescription('Créer un lien d\'affiliation avec la FNAC')
        .addStringOption(option =>
            option.setName('lien')
                .setDescription('Exemple: https://livre.fnac.com/a14859038/Spy-x-Family-Tome-1-Spy-x-Family-Tatsuya-Endo')
                .setRequired(true)),

    new SlashCommandBuilder()
        .setName('beta')
        .setDescription('Inscription à la bêta de l\'application')
        .addStringOption(option =>
            option.setName('email')
                .setDescription('Email associé à votre compte Apple ou Google')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('système')
                .setDescription('OS de votre téléphone')
                .setRequired(true)
                .addChoices(
                    { name: 'iOS', value: 'iOS' },
                    { name: 'Android', value: 'Android' },
                    )),
    new SlashCommandBuilder()
        .setName("agenda")
        .setDescription("Fournit l'agenda du jour."),

]

    .map(command => command.toJSON());


const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands("978823077959983154"), { body: commands });
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();

