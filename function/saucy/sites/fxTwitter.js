// function/saucy/sites/fxTwitter.js
// Port de SaucyBot/Site/FxTwitter.cs.
const { EmbedBuilder } = require('discord.js');
const { Colors, TwitterIconUrl, TwitterSaucyMinTextLength, TwitterTranslateLang } = require('../constants');
const fxClient = require('../clients/fxTwitterClient');
const media = require('../media');

const pattern =
  /https?:\/\/(www\.|mobile\.)?(?<domain>twitter|x|nitter)\.(com|net)\/(?<user>[^/\s]+)\/status\/(?<id>\d+)(\/(video|photo)\/\d)?(\/(?<translate>\w{2}|\w{5}))?/gi;

// Déclenchement auto : on ne sauce que si l'aperçu natif de Discord est
// insuffisant ET que le saucy apporte vraiment quelque chose de plus.
// - Tweet principal : Discord montre le texte (tronqué ~280) et la 1re image
//   -> on sauce si texte long, vidéo, ou >= 2 images.
// - Tweet cité (quoted) : Discord n'affiche aucun média du quote, MAIS le rendu
//   (process) n'affiche le média du quote que si le principal n'a aucun média.
//   On ne déclenche donc sur le quote que dans ce cas, sinon on reposterait la
//   même unique image que l'embed natif sans révéler le média du quote.
function worthSaucing(tweet, photos, videos) {
  const longText = (tweetText(tweet) ?? '').length > TwitterSaucyMinTextLength;

  const mainPhotos = photos.filter((r) => r.source === 'main').length;
  const mainVideos = videos.filter((r) => r.source === 'main').length;
  const mainHasMedia = mainPhotos > 0 || mainVideos > 0;
  const quotedMedia =
    photos.some((r) => r.source === 'quoted') || videos.some((r) => r.source === 'quoted');

  return (
    longText ||
    mainVideos > 0 ||
    mainPhotos >= 2 ||
    (!mainHasMedia && quotedMedia)
  );
}

async function process(match, msg) {
  const g = match.groups;
  // On force toujours le français, même si l'URL précise une autre langue.
  const response = await fxClient.getTweet(g.user, g.id, TwitterTranslateLang);
  if (!response || !response.tweet) return null;
  const tweet = response.tweet;

  const photos = collectPhotos(tweet);
  const videos = collectVideos(tweet);

  // `msg` n'est fourni que par le déclenchement auto (handleMessage). La
  // commande /saucy (handleSlash) appelle process(match) sans msg -> pas de filtre.
  if (msg && !worthSaucing(tweet, photos, videos)) return null;

  const mainHasPhoto = photos.some((r) => r.source === 'main');
  const mainHasVideo = videos.some((r) => r.source === 'main');
  const quotedHasPhoto = photos.some((r) => r.source === 'quoted');
  const quotedHasVideo = videos.some((r) => r.source === 'quoted');
  const mainHasMedia = mainHasPhoto || mainHasVideo;
  const quotedHasMedia = quotedHasPhoto || quotedHasVideo;

  if (mainHasMedia) {
    return mainHasVideo
      ? handleVideo(tweet, videos, mainHasMedia)
      : handlePhoto(tweet, photos, mainHasMedia);
  }
  if (quotedHasMedia) {
    return quotedHasVideo
      ? handleVideo(tweet, videos, mainHasMedia)
      : handlePhoto(tweet, photos, mainHasMedia);
  }
  return handleRegular(tweet);
}

function collectVideos(tweet) {
  const out = [];
  for (const v of tweet.media?.videos ?? []) {
    if (v.type === 'video' || v.type === 'gif') out.push({ video: v, source: 'main' });
  }
  for (const v of tweet.quote?.media?.videos ?? []) {
    if (v.type === 'video' || v.type === 'gif') out.push({ video: v, source: 'quoted' });
  }
  return out;
}

function collectPhotos(tweet) {
  const out = [];
  for (const p of tweet.media?.photos ?? []) {
    if (p.type === 'photo') out.push({ photo: p, source: 'main' });
  }
  for (const p of tweet.quote?.media?.photos ?? []) {
    if (p.type === 'photo') out.push({ photo: p, source: 'quoted' });
  }
  return out;
}

function tweetText(tweet) {
  return tweet.translation ? tweet.translation.text : tweet.text;
}

function baseEmbed(tweet) {
  const embed = new EmbedBuilder()
    .setColor(Colors.Twitter)
    .setURL(tweet.url ?? `https://twitter.com/${tweet.author.screen_name}/status/${tweet.id}`)
    .setAuthor({
      name: `${tweet.author.name} (@${tweet.author.screen_name})`,
      iconURL: tweet.author.avatar_url ?? undefined,
      url: tweet.author.url ?? `https://twitter.com/${tweet.author.screen_name}`,
    })
    .addFields(
      { name: 'Replies', value: String(tweet.replies ?? 0), inline: true },
      { name: 'Retweets', value: String(tweet.retweets ?? 0), inline: true },
      { name: 'Likes', value: String(tweet.likes ?? 0), inline: true },
      { name: 'Views', value: String(tweet.views ?? 0), inline: true },
    )
    .setFooter({ text: 'Twitter', iconURL: TwitterIconUrl });

  const text = tweetText(tweet);
  if (text) embed.setDescription(text.slice(0, 4096));
  if (tweet.created_timestamp) embed.setTimestamp(new Date(tweet.created_timestamp * 1000));
  return embed;
}

function originalResolution(url) {
  try {
    const u = new URL(url);
    u.searchParams.set('name', 'orig');
    return u.toString();
  } catch {
    return url;
  }
}

function handlePhoto(tweet, results, mainHasMedia) {
  const source = mainHasMedia ? 'main' : 'quoted';
  const embeds = results
    .filter((r) => r.source === source)
    .map((r) => baseEmbed(tweet).setImage(originalResolution(r.photo.url)));
  return { embeds, files: [], text: null };
}

async function handleVideo(tweet, results, mainHasMedia) {
  const source = mainHasMedia ? 'main' : 'quoted';
  const found = results.find((r) => r.source === source);
  if (!found) return null;

  const usable = await media.pickUsableVideoUrl([found.video.url]);
  if (!usable) {
    return {
      embeds: [],
      files: [],
      text: `https://fxtwitter.com/${tweet.author.screen_name}/status/${tweet.id}`,
    };
  }
  const file = await media.downloadAttachment(usable);
  return { embeds: [baseEmbed(tweet)], files: [file], text: null };
}

function handleRegular(tweet) {
  return { embeds: [baseEmbed(tweet)], files: [], text: null };
}

module.exports = { identifier: 'FxTwitter', pattern, color: Colors.Twitter, process };
