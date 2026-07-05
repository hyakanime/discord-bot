// function/saucy/sites/instagram.js
// Port de SaucyBot/Site/Instagram.cs : réécriture simple vers kkinstagram.com.
const { Colors } = require('../constants');

const pattern =
  /https?:\/\/(?<host>(?:www\.|m\.)?instagram\.com)\/(?<path>(?:p|reel|reels)\/[^/\s?#]+(?:\/[^\s?#]*)?)(?<query>\?[^\s#]*)?(?<fragment>#[^\s]*)?/gi;

async function process(match) {
  const path = match.groups.path;
  const query = match.groups.query || '';
  const fragment = match.groups.fragment || '';
  return {
    embeds: [],
    files: [],
    text: `https://www.kkinstagram.com/${path}${query}${fragment}`,
  };
}

module.exports = { identifier: 'Instagram', pattern, color: Colors.Instagram, process };
