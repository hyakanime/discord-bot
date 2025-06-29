const mongoose = require('mongoose');

const guildSettingsSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  guildName: { type: String },
  welcomeEnabled: { type: Boolean, default: false },
  welcomeChannelId: { type: String, default: undefined },
  hyakanimeLinkEmbedEnabled: { type: Boolean, default: false },
  editAlertEnabled: { type: Boolean, default: false },
  editAlertChannelId: { type: String, default: undefined },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  feurEnabled: { type: Boolean, default: false },
  animeNotifEnabled: { type: Boolean, default: false },
  animeNotifChannelId: { type: String, default: undefined },
});

guildSettingsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('GuildSettings', guildSettingsSchema);
