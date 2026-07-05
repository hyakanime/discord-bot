// commands/saucy.js
const { SlashCommandBuilder } = require('discord.js');
const manager = require('../function/saucy/manager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('saucy')
    .setDescription("Force l'embed enrichi d'un lien (Twitter/X, Bluesky, Instagram)")
    .addStringOption((option) =>
      option
        .setName('url')
        .setDescription('Le lien à saucer')
        .setRequired(true),
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const url = interaction.options.getString('url');
    await manager.handleSlash(interaction, url);
  },
};
