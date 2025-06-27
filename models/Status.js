const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  lastStatus: {
    type: Boolean,
    required: true
  },
  consecutiveRejections: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Status', statusSchema);