// function/contribution.js
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

module.exports = { computeNewEntries };
