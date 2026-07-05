const mongoose = require('mongoose');

const contributionStateSchema = new mongoose.Schema({
  key: { type: String, default: 'contribution', unique: true },
  seenIds: { type: [String], default: [] },
});

module.exports = mongoose.model('ContributionState', contributionStateSchema);
