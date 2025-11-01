const { EmbedBuilder } = require("discord.js");
const { logoUrl, urlEndpoint  } = require("../config.json");


async function fetchAnime(animeId, response = null) {


                        if (response === null) {
                            const result = await fetch(`${urlEndpoint}/anime/${animeId}`);
                            const data = await result.text();
                            response = JSON.parse(data);
                        }
                        const newEmbed =new EmbedBuilder()
                        .setAuthor({
                            name: "hyakanime",
                            iconURL:
                                logoUrl,
                            url: "https://hyakanime.fr",
                        })
                        .setColor("#0099ff")
                        .setTitle(response.title ? response.title : response.titleEN ? response.titleEN : response.romanji ? response.romanji : response.titleJP)
                        .setURL(`https://hyakanime.fr/anime/${response.id}`)
                        .setTimestamp()
                        .setDescription(response.synopsis === undefined ? "Pas de synopsis renseigné." : response.synopsis)
                        const embedFields = [];

                        Object.keys(response).forEach((key) => {
                            switch (key) {
                                case "image":
                                    newEmbed.setImage(response[key]);
                                    break;
                                case "genre":
                                    embedFields.push({ 
                                        name: 'Genres', 
                                        value: response[key]?.length ? response[key].join(", ") : "Pas de genres renseignés.", 
                                        inline: true 
                                    });
                                    break;
                                case "NbEpisodes":
                                    embedFields.push({ 
                                        name: "Nombre d'épisodes", 
                                        value: response[key] ? `${response[key]}` : "0", 
                                        inline: true 
                                    });
                                    break;
                                case "vf":
                                    embedFields.push({ 
                                        name: "VF", 
                                        value: response[key] ? "Oui" : "Non", 
                                        inline: true 
                                    });
                                    break;
                                case "studios":
                                    embedFields.push({ 
                                        name: "Studios", 
                                        value: response[key] || "Pas de studio renseigné", 
                                        inline: true 
                                    });
                                    break;
                                case "source":
                                    embedFields.push({ 
                                        name: "Sources", 
                                        value: response[key] || "Pas de source renseigné", 
                                        inline: true 
                                    });
                                    break;
                                case "diffuseur":
                                    if (response[key]) {
                                        let diffuseurs = [];
                                        Object.keys(response[key]).forEach((name) => {
                                            diffuseurs.push(`[${name}](${response[key][name]})`);
                                        });
                                        embedFields.push({ 
                                            name: `Diffuseur${diffuseurs.length > 1 ? "s" : ""}`, 
                                            value: diffuseurs.join(", "), 
                                            inline: true 
                                        });
                                    }
                                    break;
                                case "status":
                                    let statusMap = {
                                        1: "En cours",
                                        2: "À venir",
                                        3: "Diffusion terminée",
                                        4: "Annulé"
                                    };
                                    embedFields.push({ 
                                        name: "Status", 
                                        value: statusMap[response[key]] || "Pas de status renseigné.", 
                                        inline: true 
                                    });
                                    break;
                                case "start":
                                    embedFields.push({ 
                                        name: "Date de sortie", 
                                        value: `${response[key].day ? response[key].day + "/" : ""}${response[key].month ? response[key].month + "/" : ""}${response[key].year || ""}`, 
                                        inline: true 
                                    });
                                    break;
                                case "end":
                                    if (response[key].year !== null) {
                                        embedFields.push({ 
                                            name: "Date de fin", 
                                            value: `${response[key].day ? response[key].day + "/" : ""}${response[key].month ? response[key].month + "/" : ""}${response[key].year || ""}`, 
                                            inline: true 
                                        });
                                    }
                                    break;
                            }
                        });
                        //Afficher les champs dans un ordre précis
                        embedFields.sort((a, b) => {
                            const order = [ "Status", "Genres", "Nombre d'épisodes", "Studios", "Sources", "Diffuseurs", "Diffuseur", "VF", "Date de sortie", "Date de fin"];
                            return order.indexOf(a.name) - order.indexOf(b.name);
                        });

                        newEmbed.addFields(...embedFields);
                        return newEmbed;
}

module.exports = { fetchAnime };