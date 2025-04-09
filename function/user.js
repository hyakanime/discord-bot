const { createCanvas } = require('canvas');
const { urlEndpoint, logoUrl } = require("../config.json");
async function fetchUser(pseudo, EmbedBuilder, AttachmentBuilder) {
    const response = await fetch(urlEndpoint + "/user/" + pseudo);
        const data = await response.text();
        let result = JSON.parse(data);
        if (result?.message) {
          const response2 = await fetch(urlEndpoint + "/search/user/" + pseudo);
          const data2 = await response2.text();
          const result2 = JSON.parse(data2);
          if (result2.length == 0) {
             return { userEmbed: null, attachment: null };
          } else {
            result = result2[0];
          }
        };
        const date = new Date(result.createdAt * 1);
        const response2 = await fetch(urlEndpoint + "/progression/anime/" + result.uid);
        const data2 = await response2.text();
        const resultatProgression = JSON.parse(data2);
        const episodes = resultatProgression.length;
        console.log(episodes)
        let addition = 0;
        let revisionageEpisode = 0;
        let revisionageAnime = 0;
        for (let i = 0; i < episodes; i++) {
          addition += resultatProgression[i].progression.progression;
          if (resultatProgression[i].progression.rewatch != undefined) {
            revisionageEpisode = revisionageEpisode + resultatProgression[i].progression.rewatch * resultatProgression[i].progression.progression;
            revisionageAnime = revisionageAnime + resultatProgression[i].progression.rewatch;
          }
        }
        const responseStats = await fetch(urlEndpoint + '/progression/anime/stats/status/' + result.uid);
        const stats = await responseStats.json();
    
        const imageCanvas = await createStatsCanvas(stats);
        const attachment = new AttachmentBuilder(imageCanvas, { name: 'stats.png' });
        const userEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`${result.username} ${result.isPremium ? "★" : ""} `)
          .setURL("https://hyakanime.fr/user/" + result.username)
          .setAuthor({
            name: "Hyakanime",
            iconURL:
              logoUrl,
            url: "https://hyakanime.fr",
          })
          .setThumbnail(result.photoURL)
          .addFields(
            { name: "TITRE AJOUTÉS", value: "" + episodes, inline: true },
            { name: "ÉPISODES VUS", value: "" + addition, inline: true },
            { name: "\u200b", value: "\u200b", inline: false},
            { name: "TITRE REWATCH", value: "" + revisionageAnime, inline: true },
            { name: "ÉPISODES REWATCH", value: "" + revisionageEpisode, inline: true }
          )
          .setImage("attachment://stats.png")
          .setTimestamp()
          .setFooter({
            text:
              `Compte crée le ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`,
          });
          return { userEmbed, attachment };
}

async function createStatsCanvas(statsHyak) {
    const canvas = createCanvas(450, 120);
    const ctx = canvas.getContext('2d');
  
    const stats = {
      aVoir: statsHyak["2"] || 0,
      enPause: statsHyak["4"] || 0,
      enCours: statsHyak["1"] || 0,
      termine: statsHyak["3"] || 0,
      abandonne: statsHyak["5"] || 0,
      total: statsHyak["total"] || 0
    };
  
    const colors = {
      aVoir: '#9f9f9f',
      enPause: '#A16EFF',
      enCours: '#0099FF',
      termine: '#00CC33',
      abandonne: '#FF3333'
    };
  
    // Affichage des statistiques
    ctx.font = 'bold 14px Arial';
    const positions = [
      { label: 'Total', value: stats.total, x: 25, y: 30, color: '#FFFFFF' },
      { label: 'À voir', value: stats.aVoir, x: 25, y: 50, color: colors.aVoir },
      { label: 'En Pause', value: stats.enPause, x: 25, y: 70, color: colors.enPause },
      { label: 'En cours', value: stats.enCours, x: 260, y: 30, color: colors.enCours },
      { label: 'Terminé', value: stats.termine, x: 260, y: 50, color: colors.termine },
      { label: 'Abandonné', value: stats.abandonne, x: 260, y: 70, color: colors.abandonne }
    ];
  
    positions.forEach(({ label, value, x, y, color }) => {
      ctx.fillStyle = color;
      ctx.fillText(label, x, y);
      ctx.fillText(value, x + 100, y);
    });
  
    // Dessin de la barre de progression
    drawProgressBar(ctx, 20, 90, 375, 15, stats, colors);
  
    return canvas.toBuffer();
  }
  
  function drawProgressBar(ctx, x, y, width, height, stats, colors) {
    let currentX = x;
    const borderRadius = 7;
    const sections = [
      { value: stats.enCours, color: colors.enCours },
      { value: stats.aVoir, color: colors.aVoir },
      { value: stats.termine, color: colors.termine },
      { value: stats.enPause, color: colors.enPause },
      { value: stats.abandonne, color: colors.abandonne }
    ].filter(section => section.value > 0);
  
    sections.forEach((section, index) => {
      let sectionWidth = (section.value / stats.total) * width;
      drawRoundedRect(ctx, currentX, y, sectionWidth, height, borderRadius, section.color,
        index === 0, index === sections.length - 1);
      currentX += sectionWidth;
    });
  }
  
  function drawRoundedRect(ctx, x, y, width, height, radius, color, leftRound, rightRound) {
    ctx.fillStyle = color;
    ctx.beginPath();
  
    if (leftRound) {
      ctx.moveTo(x + radius, y);
      ctx.arcTo(x, y, x, y + radius, radius);
      ctx.lineTo(x, y + height - radius);
      ctx.arcTo(x, y + height, x + radius, y + height, radius);
    } else {
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + height);
    }
  
    if (rightRound) {
      ctx.lineTo(x + width - radius, y + height);
      ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
      ctx.lineTo(x + width, y + radius);
      ctx.arcTo(x + width, y, x + width - radius, y, radius);
    } else {
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width, y);
    }
  
    ctx.closePath();
    ctx.fill();
  }
  
  module.exports = { fetchUser };