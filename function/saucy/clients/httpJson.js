// function/saucy/clients/httpJson.js
// GET JSON avec résilience (port du pipeline Polly de SaucyBot) :
// 404 -> null, 5xx -> retries backoff+jitter, timeout -> null, sinon null.
const defaultFetch = require('node-fetch');
const { UserAgent } = require('../constants');

class RetryableError extends Error {
  constructor(status) {
    super(`retryable status ${status}`);
    this.status = status;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(url, options = {}) {
  const {
    fetchImpl = defaultFetch,
    retries = 3,
    timeoutMs = 15000,
    baseDelayMs = 3000,
  } = options;

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetchImpl(url, {
        headers: { 'User-Agent': UserAgent, Accept: 'application/json' },
        signal: controller.signal,
      });
      if (res.status === 404) return null;
      if (res.status >= 500) throw new RetryableError(res.status);
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      if (err instanceof RetryableError && attempt < retries) {
        const delay = baseDelayMs * 2 ** attempt * (0.5 + Math.random());
        await sleep(delay);
        continue;
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

module.exports = { getJson };
