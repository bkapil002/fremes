const mongoose = require("mongoose");

const RemovedUserSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true },
    name: { type: String, required: true },
    meetingType: { type: String, required: true },
    meetingTime: { type: String, required: true },
    linkId: { type: String, required: true },
    adminName: { type: String, required: true },
    admin: { type: String, required: true }, 
  },
  { timestamps: true }
);

module.exports = mongoose.model("RemovedUser", RemovedUserSchema);
