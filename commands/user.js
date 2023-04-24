const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");
module.exports = {
  data: new SlashCommandBuilder()
    .setName("user")
    .setDescription("Fournit des informations sur l’utilisateur.")
    .addStringOption((option) =>
      option
        .setName("pseudo")
        .setDescription(
          "Votre pseudo hyakanime"
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    await interaction.deferReply();
    var pseudo = interaction.options.getString("pseudo");
    let responseUser = await fetch("https://api.hyakanime.fr/user/profile-information/" + pseudo);
    let dataUser = await responseUser.text();
    var result = JSON.parse(dataUser);
    if (result.username == undefined) {
      let reponseRecherche = await fetch("https://api.hyakanime.fr/user/search/" + pseudo);
      let dataRecherche = await reponseRecherche.text();
      var resultRecherche = JSON.parse(dataRecherche);
      if (resultRecherche != "" || undefined) {
        const usernameLePlusProche = trouveLePlusProche(pseudo, resultRecherche, 'username');
        pseudo = usernameLePlusProche.username;
        let responseUser = await fetch("https://api.hyakanime.fr/user/profile-information/" + pseudo);
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
    var timestamp = result.createdAt;
    let date1 = new Date(timestamp * 1);
    let response2 = await fetch("https://api.hyakanime.fr/progress/read/" + pseudo);
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
      addition += resultatProgression[i].progression;
      if (resultatProgression[i].rewatch != undefined) {
        revisionageEpisode = revisionageEpisode + resultatProgression[i].rewatch * resultatProgression[i].progression;
        revisionageAnime = revisionageAnime + resultatProgression[i].rewatch;
      }
      i++;
    }
    if (result.isPremium == true) {
      premium = "★";
    }
    if (result.biographie[0] == undefined) {
      result.biographie = pseudo + " n'a pas de biographie";
    }
    const userEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(result.username + " " + premium)
      .setURL("https://hyakanime.fr/profile/" + pseudo)
      .setAuthor({
        name: "Hyakanime",
        iconURL:
          "https://www.hyakanime.fr/static/media/appLogo.7fac0ec4359bda8ccf0f.png",
        url: "https://hyakanime.fr",
      })
      .setDescription(result.biographie)
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

function trouveLePlusProche(target, items, propName) {
  return items.sort((a, b) => a[propName].localeCompare(target, undefined, { sensitivity: 'base' }) - b[propName].localeCompare(target, undefined, { sensitivity: 'base' }))[0];
}
