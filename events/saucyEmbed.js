// events/saucyEmbed.js
const { Events } = require('discord.js');
const manager = require('../function/saucy/manager');

module.exports = {
  name: Events.MessageCreate,
  async execute(msg) {
    await manager.handleMessage(msg);
  },
};
