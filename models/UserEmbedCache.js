const mongoose = require('mongoose');

const userEmbedCacheSchema  =  new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true, index: true },
    userData: { type: Object, required: true },
    expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true, collection: 'user_embeds_cache' });

userEmbedCacheSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserEmbedCache', userEmbedCacheSchema);
