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

const LABELS = {
  'request:accepted': { emoji: '✅', text: 'Ajout accepté' },
  'request:refused': { emoji: '❌', text: 'Ajout refusé' },
  'edit:accepted': { emoji: '✅', text: 'Modif acceptée' },
  'edit:partially': { emoji: '⚠️', text: 'Modif partielle' },
  'edit:refused': { emoji: '❌', text: 'Modif refusée' },
};

const DIGEST_TITLE = '📬 Mise à jour de tes contributions Hyakanime';
const EMBED_DESC_LIMIT = 4096; // limite Discord pour une description d'embed

// Construit une ligne récapitulative pour une contribution.
// Ex: "❌ Modif refusée : **One Piece** — Doublon"
function buildContributionLine(entry) {
  const label = LABELS[`${entry._type}:${entry._status}`];
  let line = `${label.emoji} ${label.text} : **${entry.title || 'Titre inconnu'}**`;
  if (typeof entry.comment === 'string' && entry.comment.trim() !== '') {
    const reason = entry.comment.replace(/\s+/g, ' ').trim().slice(0, 300);
    line += ` — ${reason}`;
  }
  return line;
}

// Regroupe toutes les contributions d'un utilisateur en un ou plusieurs embeds
// (plusieurs uniquement si la liste dépasse la limite de description Discord).
function buildUserDigestEmbeds(entries) {
  const lines = entries.map(buildContributionLine);

  const chunks = [];
  let current = [];
  let currentLen = 0;
  for (const line of lines) {
    if (current.length > 0 && currentLen + line.length + 1 > EMBED_DESC_LIMIT) {
      chunks.push(current);
      current = [];
      currentLen = 0;
    }
    current.push(line);
    currentLen += line.length + 1;
  }
  if (current.length > 0) chunks.push(current);

  return chunks.map((chunkLines) => new EmbedBuilder()
    .setTitle(DIGEST_TITLE)
    .setColor(0x0099ff)
    .setDescription(chunkLines.join('\n'))
    .setFooter({ text: 'Source : Hyakanime' })
    .setTimestamp());
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

      // Regrouper les nouvelles entrées par utilisateur lié → un seul DM par personne
      const perUser = new Map();
      for (const entry of newEntries) {
        const link = byUid.get(entry.uid);
        if (!link) continue; // uid non lié à un compte Discord
        if (!perUser.has(entry.uid)) perUser.set(entry.uid, { link, entries: [] });
        perUser.get(entry.uid).entries.push(entry);
      }

      for (const { link, entries: userEntries } of perUser.values()) {
        try {
          const user = await client.users.fetch(link.discordId);
          const embeds = buildUserDigestEmbeds(userEntries);
          for (const embed of embeds) {
            await user.send({ embeds: [embed] });
          }
        } catch (err) {
          console.error(`[Contribution] Échec DM à ${link.discordId} (uid ${link.hyakanimeUid}):`, err.message);
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

module.exports = { computeNewEntries, buildContributionLine, buildUserDigestEmbeds, fetchAll, checkContributions };
