// function/saucy/constants.js
// Constantes partagées du module Saucy (port de SaucyBot/Library/Constants.cs).
module.exports = {
  // Taille maximale d'upload Discord par défaut (10 Mo).
  MaximumFileSize: 10_485_760,
  // Nombre maximal d'embeds par message Discord.
  MaximumEmbedsPerMessage: 4,
  // Plafond de liens traités pour un même message.
  DefaultMaximumEmbeds: 8,
  // Longueur de texte au-delà de laquelle l'aperçu natif de Discord tronque le
  // tweet : on déclenche alors le saucy auto. (~275 observé, 280 = limite tweet)
  TwitterSaucyMinTextLength: 280,
  // Langue de traduction demandée par défaut à FxTwitter quand l'URL n'en précise
  // pas (ex. /fr en fin d'URL). FxTwitter renvoie alors tweet.translation.
  TwitterTranslateLang: 'fr',
  // Délai avant de vérifier si Discord a déjà créé l'embed Bluesky (anti-doublon).
  BlueskyEmbedDelayMs: 3000,
  // Attente max que l'embed natif Twitter arrive avant de le masquer (suppressEmbeds).
  // Discord génère l'aperçu de façon asynchrone : sans ce délai, le suppress part
  // parfois trop tôt et l'embed natif reste affiché en doublon.
  SuppressEmbedMaxWaitMs: 3000,
  // Intervalle de poll de msg.embeds pendant cette attente.
  SuppressEmbedPollMs: 250,
  // En-tête User-Agent envoyé aux APIs.
  UserAgent: 'Hyakanime-SaucyBot',
  // Icônes de footer reprises de SaucyBot.
  TwitterIconUrl:
    'https://images-ext-1.discordapp.net/external/bXJWV2Y_F3XSra_kEqIYXAAsI3m1meckfLhYuWzxIfI/https/abs.twimg.com/icons/apple-touch-icon-192x192.png',
  BlueskyIconUrl: 'https://bsky.app/static/apple-touch-icon.png',
  // Couleurs des embeds par site.
  Colors: {
    Twitter: 0x1da1f2,
    Bluesky: 0x1083fe,
    Instagram: 0xe4405f,
  },
};
