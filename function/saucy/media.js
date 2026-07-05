// function/saucy/media.js
// Sélection de la vidéo sous la limite Discord + téléchargement en pièce jointe.
const defaultFetch = require('node-fetch');
const { AttachmentBuilder } = require('discord.js');
const { MaximumFileSize } = require('./constants');

async function pickUsableVideoUrl(urls, fetchImpl = defaultFetch) {
  for (const url of urls) {
    try {
      const res = await fetchImpl(url, { method: 'HEAD' });
      const length = Number(res.headers.get('content-length'));
      if (length && length < MaximumFileSize) {
        return url;
      }
    } catch {
      // URL suivante
    }
  }
  return null;
}

async function downloadAttachment(url, fetchImpl = defaultFetch) {
  const res = await fetchImpl(url);
  const buffer = await res.buffer();
  let name = 'video.mp4';
  try {
    const candidate = decodeURIComponent(new URL(url).pathname.split('/').pop());
    if (candidate) name = candidate;
  } catch {
    // garde le nom par défaut
  }
  return new AttachmentBuilder(buffer, { name });
}

module.exports = { pickUsableVideoUrl, downloadAttachment };
