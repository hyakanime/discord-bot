// function/saucy/messageManager.js
// Port de SaucyBot/Services/MessageManager.cs (PartitionMessages + Send).
const { MaximumEmbedsPerMessage, MaximumFileSize } = require('./constants');

function partition(response) {
  const embeds = response.embeds ?? [];
  const files = response.files ?? [];
  const text = response.text ?? null;

  if (embeds.length > 1) return handleMultipleEmbeds(embeds, files, text);
  if (embeds.length === 1) return handleSingleEmbed(embeds[0], files, text);
  if (files.length >= 1) return handleFiles(files, text);
  return [{ content: text ?? '', embeds: [], files: [] }];
}

function handleSingleEmbed(embed, files, text) {
  const messages = [{ content: null, embeds: [embed], files }];
  if (text) messages.push({ content: text, embeds: [], files: [] });
  return messages;
}

function handleMultipleEmbeds(embeds, files, text) {
  const messages = [];
  if (text) messages.push({ content: text, embeds: [], files: [] });
  for (let i = 0; i < embeds.length; i += MaximumEmbedsPerMessage) {
    const chunk = embeds.slice(i, i + MaximumEmbedsPerMessage);
    const chunkFiles = [];
    for (const embed of chunk) chunkFiles.push(...relatedFiles(embed, files));
    messages.push({ content: null, embeds: chunk, files: chunkFiles });
  }
  return messages;
}

function relatedFiles(embed, files) {
  const data = embed.data ?? embed;
  const urls = [];
  if (data.image?.url) urls.push(data.image.url.replace('attachment://', ''));
  if (data.video?.url) urls.push(data.video.url.replace('attachment://', ''));
  return files.filter((f) => urls.includes(f.name));
}

function handleFiles(files, text) {
  const messages = [];
  if (text) messages.push({ content: text, embeds: [], files: [] });

  if (files.length === 1) {
    messages.push({ content: null, embeds: [], files: [files[0]] });
    return messages;
  }

  const segments = [];
  for (const file of files) {
    if (segments.length === 0) {
      segments.push([file]);
      continue;
    }
    const idx = segments.length - 1;
    const total = segments[idx].reduce((acc, f) => acc + fileSize(f), 0);
    if (fileSize(file) + total >= MaximumFileSize) {
      segments.push([file]);
      continue;
    }
    segments[idx].push(file);
  }
  for (const seg of segments) messages.push({ content: null, embeds: [], files: seg });
  return messages;
}

function fileSize(file) {
  return Buffer.isBuffer(file.attachment) ? file.attachment.length : 0;
}

function isEmpty(message) {
  return (
    (!message.content || message.content === '') &&
    message.embeds.length === 0 &&
    message.files.length === 0
  );
}

// Envoie la réponse. Pour une interaction : 1er message via editReply, le reste
// via followUp (consomme le deferReply). Pour un message : reply sans ping.
async function send(target, response, isInteraction = false) {
  const messages = partition(response).filter((m) => !isEmpty(m));
  let first = true;
  for (const m of messages) {
    const payload = {
      content: m.content ?? '',
      embeds: m.embeds,
      files: m.files,
      allowedMentions: { parse: [] },
    };
    if (isInteraction) {
      if (first) await target.editReply(payload);
      else await target.followUp(payload);
    } else {
      await target.reply({ ...payload, allowedMentions: { parse: [], repliedUser: false } });
    }
    first = false;
  }
  return messages.length;
}

module.exports = { partition, send, isEmpty };
