// function/saucy/cache.js
// Cache mémoire minimal avec expiration (port de CacheManager.Remember de SaucyBot).
const store = new Map();

async function remember(key, ttlMs, producer) {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.value;
  }
  const value = await producer();
  if (value !== null && value !== undefined) {
    store.set(key, { value, expiresAt: now + ttlMs });
  }
  return value;
}

function clear() {
  store.clear();
}

module.exports = { remember, clear };
