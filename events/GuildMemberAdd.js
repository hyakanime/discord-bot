const { Events, EmbedBuilder, PermissionsBitField } = require('discord.js');
const mongoose = require('mongoose');
const GuildSettings = require('../models/GuildSettings');

// Définir le modèle pour les phrases de bienvenue
const welcomePhraseSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'bienvenue'
});

const WelcomePhrase = mongoose.model('WelcomePhrase', welcomePhraseSchema);

// Fonction pour récupérer une phrase aléatoire
async function getRandomWelcomePhrase() {
  try {
    const randomPhrase = await WelcomePhrase.aggregate([{ $sample: { size: 1 } }]);
    return randomPhrase.length > 0 ? randomPhrase[0].text : null;
  } catch (error) {
    console.error('Erreur lors de la récupération d\'une phrase aléatoire:', error);
    return null;
  }
}

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    try {
      // Récupérer les paramètres du serveur
      const guildId = member.guild.id;
      const settings = await GuildSettings.findOne({ guildId });

      // Si aucun paramètre ou bienvenue désactivée, on sort
      if (!settings?.welcomeEnabled) return;

      // Récupérer une phrase aléatoire
      const welcomePhrase = await getRandomWelcomePhrase();
      if (!welcomePhrase) {
        console.log('Aucune phrase de bienvenue disponible dans la base de données');
        return;
      }

      // Vérifier si un canal est configuré
      if (!settings.welcomeChannelId) {
        console.log(`Bienvenue activée mais aucun canal configuré pour le serveur ${member.guild.name} (${guildId})`);
        // Optionnel: Envoyer un message aux admins du serveur
        return;
      }

      // Récupérer le canal
      let channel;
      try {
        channel = await member.guild.channels.fetch(settings.welcomeChannelId);
      } catch (error) {
        console.error(`Erreur lors de la récupération du canal de bienvenue pour le serveur ${member.guild.name}:`, error);
        return;
      }

      // Vérifier que le canal existe et est textuel
      if (!channel || !channel.isTextBased()) {
        console.log(`Le canal configuré (${settings.welcomeChannelId}) n'est pas un canal textuel ou n'existe pas dans ${member.guild.name}`);
        return;
      }

      // Vérifier les permissions du bot
      const botPermissions = channel.permissionsFor(member.guild.members.me);
      if (!botPermissions || !botPermissions.has(PermissionsBitField.Flags.SendMessages)) {
        console.log(`Le bot n'a pas la permission d'envoyer des messages dans le canal ${channel.name} sur ${member.guild.name}`);
        return;
      }

      // Créer et envoyer l'embed
      const embedBienvenue = new EmbedBuilder()
        .setTitle("Nouveau membre !")
        .setDescription(welcomePhrase.replace("*", `<@${member.user.id}>`))
        .setThumbnail(member.user.avatarURL())
        .setFooter({ text: 'Hyakanime', iconUrl: member.user.avatarURL() })
        .setColor('#35B0FF')
        .setTimestamp();

      await channel.send({ embeds: [embedBienvenue] });
      console.log(`Message de bienvenue envoyé à ${member.user.tag} dans le serveur ${member.guild.name}`);

    } catch (error) {
      console.error(`Erreur lors du traitement du nouvel arrivant ${member.user.tag} dans ${member.guild.name}:`, error);
    }
  },
  WelcomePhrase
};
