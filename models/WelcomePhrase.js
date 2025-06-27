const mongoose = require('mongoose');

const welcomePhraseSchema = new mongoose.Schema({

  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'welcomephrase'
});

module.exports = mongoose.model('WelcomePhrase', welcomePhraseSchema);