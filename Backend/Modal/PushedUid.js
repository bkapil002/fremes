const mongoose = require('mongoose');

const pushedUidSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  ts: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PushedUid', pushedUidSchema);