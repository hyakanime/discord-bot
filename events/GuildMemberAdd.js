const { Events, EmbedBuilder } = require('discord.js');
const { guildId, channelBienvenue } = require('../config.json');
const mongoose = require('mongoose');

// Définir le modèle pour les phrases de bienvenue
const welcomePhraseSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'bienvenue' // Nom explicite de la collection
});

const WelcomePhrase = mongoose.model('WelcomePhrase', welcomePhraseSchema);

// Fonction pour récupérer une phrase aléatoire
async function getRandomWelcomePhrase() {
  try {
    // Utilise $sample pour sélectionner une phrase aléatoire directement dans la requête
    const randomPhrase = await WelcomePhrase.aggregate([
      { $sample: { size: 1 } }
    ]);

    return randomPhrase.length > 0 ? randomPhrase[0].text : null;
  } catch (error) {
    console.error('Erreur lors de la récupération d\'une phrase aléatoire:', error);
    return null;
  }
}

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Vérifier que le membre est du bon serveur
    if (member.guild.id !== guildId) return;

    try {
      // Récupérer une phrase aléatoire
      const welcomePhrase = await getRandomWelcomePhrase();

      if (!welcomePhrase) {
        console.log('Aucune phrase de bienvenue disponible dans la base de données');
        return;
      }

      // Créer l'embed de bienvenue
      const embedBienvenue = new EmbedBuilder()
        .setTitle("Nouveau membre !")
        .setDescription(welcomePhrase.replace("*", `<@${member.user.id}>`))
        .setThumbnail(member.user.avatarURL())
        .setFooter({ text: 'Hyakanime', iconUrl: member.user.avatarURL() })
        .setColor('#35B0FF')
        .setTimestamp();

      // Récupérer le canal et envoyer le message
      const channel = member.guild.channels.cache.get(channelBienvenue);
      if (channel?.isTextBased()) {
        await channel.send({ embeds: [embedBienvenue] });
      } else {
        console.log('Le canal de bienvenue n\'existe pas ou n\'est pas un canal textuel');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message de bienvenue:', error);
    }
  },
  // Exporter aussi le modèle pour pouvoir l'utiliser ailleurs si besoin
  WelcomePhrase
};
