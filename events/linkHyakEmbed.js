const { Events, EmbedBuilder, AttachmentBuilder} = require("discord.js");
const fetch = require("node-fetch");
const {logoUrl, urlEndpoint} = require("../config.json");
const { fetchUser } = require("../function/user.js");
module.exports = {
    name: Events.MessageCreate,
    async execute(msg) {
        if(msg.author.bot) return;
        const message = msg.content;
        const regex = /https?:\/\/[^\s]+/g;
        const link = message.match(regex)[0];
        if(!link) return;
        let info = link.replace("https://", "").replace("http://", "").replace("www.", "").split("/");
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
                        .setTitle(response.title ? response.title : response.titleEN ? response.titleEN : response.romanji ? response.romanji : response.titleJP )
                        .setURL(`https://hyakanime.fr/anime/${response.id}`)

                        .setTimestamp();
                        if(!response.adult){
                            embed.setThumbnail(response.image).setDescription(response.synopsis === undefined ? "Pas de synopsis renseigné." : response.synopsis.slice(0, 200) + "...")
                        }else{
                            embed.setDescription("Ce contenu est réservé à un public averti.")
                        }
                    await msg.suppressEmbeds(true);

                    await msg.reply({embeds: [embed], allowedMentions: {repliedUser: false}});

            }else if(info[1] === "user"){
                let pseudo = info[2];
                const { userEmbed, attachment } = await fetchUser(pseudo, EmbedBuilder, AttachmentBuilder);
                    if (userEmbed == null) {
                        return;
                    }
                
                    await msg.suppressEmbeds(true);
                    await msg.reply({ embeds: [userEmbed], allowedMentions: {repliedUser: false}, files: [attachment] });
                  
            }
        }
    }
}
