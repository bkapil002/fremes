const mongoose = require("mongoose");

const PromotedUidSchema = new mongoose.Schema({
  roomId: { type: String, required: true }, // Can be linkId or channelId
  uid: { type: String, required: true },
  ts: { type: Number, required: true },
});

module.exports = mongoose.model("PromotedUid", PromotedUidSchema);