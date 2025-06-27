const mongoose = require('mongoose');

const userLinkSchema = new mongoose.Schema({
  discordId: { type: String, required: true, unique: true },
  discordUsername: { type: String, required: true },
  hyakanimePseudo: { type: String, required: true },
  hyakanimeUid: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userLinkSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserLinks', userLinkSchema);