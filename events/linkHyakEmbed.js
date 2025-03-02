const { Events, EmbedBuilder} = require("discord.js");
const fetch = require("node-fetch");
const {logoUrl, urlEndpoint} = require("../config.json");

module.exports = {
    name: Events.MessageCreate,
    async execute(msg) {
        if(msg.author.bot) return;
        const message = msg.content;
        const regex = /https?:\/\/[^\s]+/g;
        const link = message.match(regex)[0];
        if(!link) return;
        let info = link.replace("https://", "").replace("http://", "").replace("www.", "").split("/");
        console.log(info);
        if(info[0] === "hyakanime.fr"){
            if(info[1] === "anime"){
                const result = await fetch(`${urlEndpoint}/anime/${info[2]}`);
                const data = await result.text();
                const response = JSON.parse(data);
                    const embed = new EmbedBuilder()
                        .setAuthor({
                            name: "hyakanime",
                            iconURL:
                                logoUrl,
                            url: "https://hyakanime.fr",
                        })
                        .setColor("#0099ff")
                        .setTitle(response.title)
                        .setURL(`https://hyakanime.fr/anime/${response.id}`)
                        
                        .setTimestamp();
                        if(!response.adult){
                            embed.setThumbnail(response.image).setDescription(response.synopsis.slice(0, 200) + "...")
                        }else{
                            embed.setDescription("Ce contenu est réservé à un public averti.")
                        }
                    //supprimer l'embed du msg
                    await msg.suppressEmbeds(true);

                    await msg.reply({embeds: [embed], allowedMentions: {repliedUser: false}});
                
            }
        }
    }
}