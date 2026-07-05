// function/contribution.js
const { EmbedBuilder } = require('discord.js');
const { urlEndpoint, tokenHyakanime } = require('../config.json');
const ContributionState = require('../models/ContributionState');
const UserLink = require('../models/UserLink');

function computeNewEntries(previousSeenIds, entries) {
  const seen = new Set(previousSeenIds || []);
  const dedup = new Map();
  for (const entry of entries) {
    if (!dedup.has(entry._id)) dedup.set(entry._id, entry);
  }
  const deduped = Array.from(dedup.values());
  const newEntries = deduped.filter((e) => !seen.has(e._id));
  const currentIds = deduped.map((e) => e._id);
  return { newEntries, currentIds };
}

const WORDING = {
  'request:accepted': { title: (t) => `✅ Ta demande d'ajout de **${t}** a été acceptée !`, color: 0x00FF00 },
  'request:refused': { title: (t) => `❌ Ta demande d'ajout de **${t}** a été refusée.`, color: 0xFF0000 },
  'edit:accepted': { title: (t) => `✅ Ta proposition de modification pour **${t}** a été acceptée !`, color: 0x00FF00 },
  'edit:partially': { title: (t) => `⚠️ Ta proposition de modification pour **${t}** a été partiellement acceptée.`, color: 0xFF9900 },
  'edit:refused': { title: (t) => `❌ Ta proposition de modification pour **${t}** a été refusée.`, color: 0xFF0000 },
};

function buildDmEmbed(entry) {
  const spec = WORDING[`${entry._type}:${entry._status}`];
  const embed = new EmbedBuilder()
    .setTitle(spec.title(entry.title || 'Titre inconnu'))
    .setColor(spec.color)
    .setFooter({ text: 'Source : Hyakanime' })
    .setTimestamp();

  if (typeof entry.comment === 'string' && entry.comment.trim() !== '') {
    embed.addFields({ name: 'Raison', value: entry.comment.slice(0, 1024) });
  }
  return embed;
}

const ENDPOINTS = [
  { type: 'edit', status: 'partially' },
  { type: 'edit', status: 'refused' },
  { type: 'edit', status: 'accepted' },
  { type: 'request', status: 'accepted' },
  { type: 'request', status: 'refused' },
];

async function fetchAll() {
  const entries = [];
  let ok = true;
  for (const { type, status } of ENDPOINTS) {
    try {
      const res = await fetch(`${urlEndpoint}/${type}?status=${status}`, {
        headers: { authorization: `Token ${tokenHyakanime}` },
      });
      if (!res.ok) { ok = false; continue; }
      const arr = await res.json();
      if (!Array.isArray(arr)) { ok = false; continue; }
      for (const e of arr) {
        entries.push({ ...e, _type: type, _status: status });
      }
    } catch (err) {
      console.error(`[Contribution] Erreur fetch ${type}?status=${status}:`, err.message);
      ok = false;
    }
  }
  return { entries, ok };
}

async function checkContributions(client) {
  try {
    const { entries, ok } = await fetchAll();

    let state = await ContributionState.findOne({ key: 'contribution' });
    const { newEntries, currentIds } = computeNewEntries(state ? state.seenIds : [], entries);

    // Premier lancement : on mémorise sans notifier (uniquement si tous les fetch ont réussi)
    if (!state) {
      if (ok) {
        await ContributionState.create({ key: 'contribution', seenIds: currentIds });
      }
      return;
    }

    if (newEntries.length > 0) {
      const links = await UserLink.find({});
      const byUid = new Map(links.map((l) => [l.hyakanimeUid, l]));

      for (const entry of newEntries) {
        const link = byUid.get(entry.uid);
        if (!link) continue; // uid non lié à un compte Discord
        try {
          const user = await client.users.fetch(link.discordId);
          await user.send({ embeds: [buildDmEmbed(entry)] });
        } catch (err) {
          console.error(`[Contribution] Échec DM à ${link.discordId} (uid ${entry.uid}):`, err.message);
        }
      }
    }

    // On n'écrit l'état que si les 5 fetch ont réussi, pour ne pas marquer
    // « vues » des entrées d'un endpoint temporairement en erreur.
    if (ok) {
      state.seenIds = currentIds;
      await state.save();
    }
  } catch (error) {
    console.error('[Contribution] Erreur lors de la vérification:', error);
  }
}

module.exports = { computeNewEntries, buildDmEmbed, fetchAll, checkContributions };
