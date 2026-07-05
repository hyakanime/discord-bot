// function/contribution.js
const { EmbedBuilder } = require('discord.js');

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
  'request:Accepted': { title: (t) => `✅ Ta demande d'ajout de **${t}** a été acceptée !`, color: 0x00FF00 },
  'request:refused': { title: (t) => `❌ Ta demande d'ajout de **${t}** a été refusée.`, color: 0xFF0000 },
  'edit:Accepted': { title: (t) => `✅ Ta proposition de modification pour **${t}** a été acceptée !`, color: 0x00FF00 },
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

module.exports = { computeNewEntries, buildDmEmbed };
