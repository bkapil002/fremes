const mongoose = require('mongoose');

const meetingAttendanceSchema = new mongoose.Schema({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'agoraa',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name:{
   type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  meetingType: {
    type: String,
    required: true
  },
  meetingTime:{
    type: String,
    required: true
  },
   meetingDate:{
    type: String,
    required: true
  },
  linkId:{
    type:String,
    required: true
  },
  joinTime: {
    type: Date,
    required: true
  },
  leaveTime: {
    type: Date,
  }
},{ timestamps: true });

const MeetingAttendance = mongoose.model('meetingAttendance', meetingAttendanceSchema);
module.exports = MeetingAttendance;
