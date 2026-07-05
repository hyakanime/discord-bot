// function/saucy/clients/fxTwitterClient.js
const httpJson = require('./httpJson');
const cache = require('../cache');

const BASE_URL = 'https://api.fxtwitter.com';
const TTL_MS = 5 * 60 * 1000;

async function getTweet(name, id, translate = null) {
  const url = translate
    ? `${BASE_URL}/${name}/status/${id}/${translate}`
    : `${BASE_URL}/${name}/status/${id}`;
  const key = translate
    ? `fxtwitter.tweet_${name}_${id}_${translate}`
    : `fxtwitter.tweet_${name}_${id}`;
  return cache.remember(key, TTL_MS, () => httpJson.getJson(url));
}

module.exports = { getTweet };
