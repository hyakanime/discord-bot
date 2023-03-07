const { SlashCommandBuilder,EmbedBuilder } = require("discord.js");
const fetch = require("node-fetch");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("agenda")
    .setDescription("Fournit l'agenda du jour."),

  async execute(interaction) {
  
    await interaction.deferReply();
    let date = new Date();
    if (date.getTimezoneOffset() == 0)
    {
       var changementTimestamp = 3600000;
       var changementHeure = 1;
    }
    else
    {
        var changementTimestamp = 0;
        var changementHeure = 0;
    }
    date.setHours(0, 0, 0, 0);
    timestampAjrd = Date.parse(date)-changementTimestamp;
    date.setDate(date.getDate() + 1);
    timestampDemain = Date.parse(date)-changementTimestamp;
    let headersList = {
      Accept: "*/*",
      "User-Agent": "Thunder Client (https://www.thunderclient.com)",
    };
    let response = await fetch(
      "https://api.hyakanime.fr/episode/sortie-hebdo/" +
        timestampAjrd +
        "/" +
        timestampDemain,
      {
        method: "GET",
        headers: headersList,
      }
    );

    let data = await response.text();
    var result = JSON.parse(data);
    var i = 0;
    var b = 0;
    var nom = [];
    var episode = [];
    var timestamp = [];
    while (i < result.length) {
      if (result[i].displayCalendar == true) {
        nom[b] = result[i].animeTitle;
        episode[b] = result[i].title;
        const heure = new Date(result[i].timestamp);
        
        if (heure.getMinutes() == 0) {
          timestamp[b] = heure.getHours()+changementHeure + "h00" ;
        } else {
          timestamp[b] = heure.getHours()+changementHeure + "h" + heure.getMinutes();
        }
        b++;
      }
      i++;
    }
    i = 0;
    const exampleEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Agenda du Jour")
      .setURL("https://hyakanime.fr/agenda")
      .setAuthor({
        name: "hyakanime",
        iconURL:
          "https://www.hyakanime.fr/static/media/appLogo.7fac0ec4359bda8ccf0f.png",
        url: "https://hyakanime.fr",
      })
      .setTimestamp();
      i=0
      while (i < nom.length) {
        exampleEmbed.addFields({name: timestamp[i], value: nom[i].slice(0, 43)+" - "+episode[i], inline: false})
      i++;
      }
        
      
    await interaction.editReply({ embeds: [exampleEmbed] });
  }
};
