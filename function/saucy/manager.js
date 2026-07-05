// function/saucy/manager.js
// Port de SaucyBot/Services/SiteManager.cs.
const { PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../models/GuildSettings');
const messageManager = require('./messageManager');
const {
  DefaultMaximumEmbeds,
  SuppressEmbedMaxWaitMs,
  SuppressEmbedPollMs,
} = require('./constants');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Attend que Discord ait attaché l'embed natif (généré de façon asynchrone)
// avant de le masquer, sinon le suppress part trop tôt et l'embed reste affiché.
async function waitForNativeEmbed(msg) {
  let waited = 0;
  while (waited < SuppressEmbedMaxWaitMs) {
    if (msg.embeds && msg.embeds.length > 0) return;
    await sleep(SuppressEmbedPollMs);
    waited += SuppressEmbedPollMs;
  }
}

const fxTwitter = require('./sites/fxTwitter');
const bluesky = require('./sites/bluesky');
const instagram = require('./sites/instagram');

const SITES = [fxTwitter, bluesky, instagram];

// Identifiant de site -> champ booléen correspondant dans GuildSettings.
const SITE_TOGGLE = {
  FxTwitter: 'saucyTwitterEnabled',
  Bluesky: 'saucyBlueskyEnabled',
  Instagram: 'saucyInstagramEnabled',
};

// Ignore le contenu entre <...> (liens supprimés) ou ||spoilers||.
const IGNORE_CONTENT = /(<|\|\|)(?!@|#|:|a:).*(>|\|\|)/i;

function matchContent(content, enabledIdentifiers, maxEmbeds) {
  const results = [];
  for (const site of SITES) {
    if (!enabledIdentifiers.includes(site.identifier)) continue;
    for (const match of content.matchAll(site.pattern)) {
      results.push({ site, match });
      if (results.length >= maxEmbeds) return results;
    }
  }
  return results;
}

function botPermissions(msg) {
  const me = msg.guild?.members?.me;
  return me ? msg.channel.permissionsFor(me) : null;
}

function hasEmbedPermissions(msg) {
  const perms = botPermissions(msg);
  if (!perms) return false;
  return (
    perms.has(PermissionFlagsBits.SendMessages) &&
    perms.has(PermissionFlagsBits.EmbedLinks) &&
    perms.has(PermissionFlagsBits.AttachFiles) &&
    perms.has(PermissionFlagsBits.ReadMessageHistory)
  );
}

function hasManageMessages(msg) {
  const perms = botPermissions(msg);
  return perms ? perms.has(PermissionFlagsBits.ManageMessages) : false;
}

async function handleMessage(msg) {
  try {
    if (msg.author?.bot || !msg.content) return;
    if (!msg.content.includes('://')) return;
    if (IGNORE_CONTENT.test(msg.content)) return;
    if (!msg.guild) return;
    if (!hasEmbedPermissions(msg)) return;

    const settings = await GuildSettings.findOne({ guildId: msg.guild.id });
    if (!settings) return;

    const enabled = SITES
      .filter((s) => settings[SITE_TOGGLE[s.identifier]])
      .map((s) => s.identifier);
    if (enabled.length === 0) return;

    const results = matchContent(msg.content, enabled, DefaultMaximumEmbeds);
    if (results.length === 0) return;

    let processedAny = false;
    for (const { site, match } of results) {
      try {
        const response = await site.process(match, msg);
        if (!response) continue;
        await messageManager.send(msg, response, false);
        processedAny = true;
      } catch (err) {
        console.error(`[saucy] erreur de traitement (${site.identifier}) :`, err);
      }
    }

    if (processedAny && hasManageMessages(msg)) {
      try {
        await waitForNativeEmbed(msg);
        await msg.suppressEmbeds(true);
      } catch {
        // pas grave si on n'arrive pas à masquer l'embed natif
      }
    }
  } catch (err) {
    console.error('[saucy] handleMessage :', err);
  }
}

async function handleSlash(interaction, url) {
  const results = matchContent(url, SITES.map((s) => s.identifier), DefaultMaximumEmbeds);
  if (results.length === 0) {
    await interaction.editReply({ content: 'Cette URL ne peut pas être saucée.' });
    return;
  }

  let sent = 0;
  for (const { site, match } of results) {
    try {
      const response = await site.process(match); // pas de msg -> pas d'anti-doublon
      if (!response) continue;
      sent += await messageManager.send(interaction, response, true);
    } catch (err) {
      console.error(`[saucy] erreur slash (${site.identifier}) :`, err);
    }
  }

  if (sent === 0) {
    await interaction.editReply({ content: "Impossible de créer l'embed pour cette URL." });
  }
}

module.exports = { handleMessage, handleSlash, matchContent };
