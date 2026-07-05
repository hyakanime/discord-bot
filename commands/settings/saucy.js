// commands/settings/saucy.js
module.exports = async function (interaction, settings) {
  const twitter = interaction.options.getBoolean('twitter');
  const bluesky = interaction.options.getBoolean('bluesky');
  const instagram = interaction.options.getBoolean('instagram');

  if (twitter !== null) settings.saucyTwitterEnabled = twitter;
  if (bluesky !== null) settings.saucyBlueskyEnabled = bluesky;
  if (instagram !== null) settings.saucyInstagramEnabled = instagram;
};
