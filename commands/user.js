const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
const { urlEndpoint, logoUrl } = require("../config.json");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Fournit des informations sur l’utilisateur.")
    .addStringOption((option) =>
      option
        .setName("pseudo")
        .setDescription(
          "Votre pseudo Hyakanime"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    var pseudo = interaction.options.getString("pseudo");
    let responseUser = await fetch(urlEndpoint+"/user/" + pseudo);
    let dataUser = await responseUser.text();
    var result = JSON.parse(dataUser);
    var uid = result.uid;
    if (result.username == undefined) {
      let reponseRecherche = await fetch(urlEndpoint+"/search/user/" + pseudo);
      let dataRecherche = await reponseRecherche.text();
      var resultRecherche = JSON.parse(dataRecherche);
      if (resultRecherche != "" || undefined) {
        const usernameLePlusProche = trouveLePlusProche(pseudo, resultRecherche, 'username');
        pseudo = usernameLePlusProche.username;
        let responseUser = await fetch(urlEndpoint+"/user/" + pseudo);
        let dataUser = await responseUser.text();
        var result = JSON.parse(dataUser);
      }
      else {
        await interaction.editReply({
          content:
            "Le pseudo n'est pas correct, veuillez vérifier si vous l'avez bien écrit",
          ephemeral: true,
        });
      }
    }
    if(uid != undefined){
    var timestamp = result.createdAt;
    let date1 = new Date(timestamp * 1);
    let response2 = await fetch(urlEndpoint+"/progression/anime/" + uid);
    let data2 = await response2.text();
    var resultatProgression = JSON.parse(data2);
    var premium = "";
    var episodes = resultatProgression.length;
    var addition = 0;
    var i = 0;
    var revisionageEpisode = 0;
    var revisionageAnime = 0;
    var mois = date1.getMonth() + 1;
    while (i < episodes) {
      addition += resultatProgression[i].progression.progression;
      if (resultatProgression[i].progression.rewatch != undefined) {
        revisionageEpisode = revisionageEpisode + resultatProgression[i].progression.rewatch * resultatProgression[i].progression.progression;
        revisionageAnime = revisionageAnime + resultatProgression[i].progression.rewatch;
      }
      i++;
    }
    if (result.isPremium == true) {
      premium = "★";
    }
    const userEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(result.username + " " + premium)
      .setURL("https://hyakanime.fr/user/" + pseudo)
      .setAuthor({
        name: "Hyakanime",
        iconURL:
          logoUrl,
        url: "https://hyakanime.fr",
      })
      .setThumbnail(result.photoURL)
      .addFields(
        { name: "TITRE AJOUTÉS", value: "" + episodes, inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
        { name: "ÉPISODES VUS", value: "" + addition, inline: true },
        { name: "TITRE REWATCH", value: "" + revisionageAnime, inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
        { name: "ÉPISODES REWATCH", value: "" + revisionageEpisode, inline: true }
      )
      .setTimestamp()
      .setFooter({
        text:
          "Compte créer le " +
          date1.getDate() +
          "/" +
          mois +
          "/" +
          date1.getFullYear(),
      });

    await interaction.editReply({ embeds: [userEmbed] });
  }
}
}

function trouveLePlusProche(target, items, propName) {
  return items.sort((a, b) => a[propName].localeCompare(target, undefined, { sensitivity: 'base' }) - b[propName].localeCompare(target, undefined, { sensitivity: 'base' }))[0];
}
