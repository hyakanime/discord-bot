const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { fetchAnime } = require("../function/anime.js");
const { urlEndpoint } = require("../config.json");

let timeoutId;

module.exports = {
    data: new SlashCommandBuilder()
        .setName("recherche")
        .setDescription("J'vous présente un animé à regarder")
        .addStringOption(option =>
            option.setName('titre')
                .setDescription('Rechercher un anime ou un utilisateur')
                .setAutocomplete(true)
                .setRequired(true),
        )
        .addBooleanOption(option => option
            .setName("visible")
            .setDescription("Afficher la recherche pour tout le monde ?")
            .setRequired(false)
        ),
    async autocomplete(interaction) {
        const searchText = interaction.options.getFocused();

        let choices = []
        clearTimeout(timeoutId);
        if (searchText.length >= 2)
            timeoutId = setTimeout(async () => {

                try {
                    let response = await fetch(`${urlEndpoint}/explore?search=${searchText}&page=1`)

                    if (response.ok) {
                        let data = await response.json();
                        choices = data.map(anime => ({
                            title: anime.title ? anime.title : anime.titleEN ? anime.titleEN : anime.romanji ? anime.romanji : anime.titleJP ? anime.titleJP : "Titre inconnu",
                            id: `${anime.id}`,
                        }));


                        if (choices.length === 0) {
                            choices = [{ title: "Aucun résultat trouvé", id: "null" }]
                        }

                        await interaction.respond(
                            choices.slice(0, 10).map(choice => ({ name: choice.title, value: `${choice.title}` })),
                        );
                    }
                    else
                        await interaction.respond([{ title: "Aucun résultat trouvé", id: "null" }])
                }
                catch (error) {
                    console.log("error", error)
                }
            }, 400);
    },
    async execute(interaction) {
        let animeTitre = interaction.options.getString('titre');
        const visible = interaction.options.getBoolean("visible") || false;
        await interaction.reply({ content: "Recherche en cours...", ephemeral: !visible });
        const response = await fetch(`${urlEndpoint}/explore?search=${animeTitre}&page=1`)
        if (response.ok) {
            let data = await response.json();
            if (data.length === 0) {
                await interaction.editReply({ content: "Aucun résultat trouvé." });
                return;
            }
            const animeEmbed = await fetchAnime(data[0].id);
            await interaction.editReply({ content: "", embeds: [animeEmbed] });
            return;
        }else{
            await interaction.editReply({ content: "Aucun résultat trouvé." });
            return;
        }

        
    },
};