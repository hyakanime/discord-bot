const mongoose = require('mongoose');

const userEmbedCacheSchema  =  new mongoose.Schema({
    pseudo: { type: String, required: true, unique: true, index: true },
    userEmbed: { type: Object, required: true },
    attachment: { type: Buffer, required: true },
    attachmentName: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true }
}, { timestamps: true, collection: 'user_embeds_cache' });

userEmbedCacheSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('UserEmbedCache', userEmbedCacheSchema);
