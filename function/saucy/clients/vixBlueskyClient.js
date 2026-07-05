// function/saucy/clients/vixBlueskyClient.js
const httpJson = require('./httpJson');
const cache = require('../cache');

const BASE_URL = 'https://bskyx.app';
const TTL_MS = 5 * 60 * 1000;

async function getPost(name, id) {
  const url = `${BASE_URL}/profile/${name}/post/${id}/json`;
  return cache.remember(`vixbluesky.post_${name}_${id}`, TTL_MS, () =>
    httpJson.getJson(url),
  );
}

module.exports = { getPost };
