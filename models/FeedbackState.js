const mongoose = require('mongoose');

const feedbackStateSchema = new mongoose.Schema({
  key: { type: String, default: 'feedback', unique: true },
  lastIds: { type: [String], default: [] }
});

module.exports = mongoose.model('FeedbackState', feedbackStateSchema);
