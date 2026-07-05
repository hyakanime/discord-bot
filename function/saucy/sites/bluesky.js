// function/saucy/sites/bluesky.js
// Port de SaucyBot/Site/Bluesky.cs.
const { EmbedBuilder } = require('discord.js');
const { Colors, BlueskyIconUrl, BlueskyEmbedDelayMs } = require('../constants');
const vixClient = require('../clients/vixBlueskyClient');

const pattern =
  /https?:\/\/(www\.)?bsky\.app\/profile\/(?<user>[^/\s]+)\/post\/(?<id>[^/\s]+)\/?/gi;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function process(match, msg = null, delayMs = BlueskyEmbedDelayMs) {
  const g = match.groups;
  const response = await vixClient.getPost(g.user, g.id);
  const post = response?.posts?.[0];
  if (!post) return null;

  const url = `https://bsky.app/profile/${g.user}/post/${g.id}`;

  // Anti-doublon : laisse à Discord le temps d'embarquer lui-même, puis vérifie.
  if (msg) {
    await sleep(delayMs);
    if (msg.embeds && msg.embeds.length !== 0) return null;
  }

  const images = post.embed?.images ?? post.embed?.media?.images ?? [];
  const hasVideo = Boolean(post.embed?.playlist);

  if (hasVideo) {
    return { embeds: [], files: [], text: `https://bskyx.app/profile/${g.user}/post/${g.id}` };
  }
  if (images.length) {
    const embeds = images.map((img) => baseEmbed(url, post).setImage(img.fullsize));
    return { embeds, files: [], text: null };
  }
  return { embeds: [baseEmbed(url, post)], files: [], text: null };
}

function baseEmbed(url, post) {
  const embed = new EmbedBuilder()
    .setColor(Colors.Bluesky)
    .setURL(url)
    .setAuthor({
      name: `${post.author.displayName} (@${post.author.handle})`,
      iconURL: post.author.avatar ?? undefined,
      url: `https://bsky.app/profile/${post.author.handle}`,
    })
    .addFields(
      { name: 'Replies', value: String(post.replyCount ?? 0), inline: true },
      { name: 'Reposts', value: String(post.repostCount ?? 0), inline: true },
      { name: 'Quotes', value: String(post.quoteCount ?? 0), inline: true },
      { name: 'Likes', value: String(post.likeCount ?? 0), inline: true },
    )
    .setFooter({ text: 'Bluesky', iconURL: BlueskyIconUrl });

  if (post.record?.text) embed.setDescription(post.record.text.slice(0, 4096));
  if (post.record?.createdAt) embed.setTimestamp(new Date(post.record.createdAt));
  return embed;
}

module.exports = { identifier: 'Bluesky', pattern, color: Colors.Bluesky, process };
