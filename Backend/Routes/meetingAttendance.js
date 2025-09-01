const express = require('express');
const router = express.Router();
const dayjs = require('dayjs');
const { auth } = require('../middleware/auth');
const Agora = require('../Modal/Agoraa');
const MeetingAttendance = require('../Modal/MeetingAttendance');


router.post('/meeting/join/:linkId', auth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const user = req.user;

    const meeting = await Agora.findOne({ linkId });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.user._id.toString() === user._id.toString()) {
      return res.status(200).json({ message: 'Creator join ignored' });
    }

    const log = new MeetingAttendance({
       meetingId: meeting._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      meetingType: meeting.meetingType,
      meetingTime: meeting.meetingTime,
      meetingDate: meeting.meetingDate,
      joinTime: new Date()
    });

    await log.save();

    res.status(200).json({ message: 'Join time recorded', log });
  } catch (error) {
    console.error('Error logging join time:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/meeting/leave/:linkId', auth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const user = req.user;

    const meeting = await Agora.findOne({ linkId });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.user._id.toString() === user._id.toString()) {
      return res.status(200).json({ message: 'Creator leave ignored' });
    }

    const log = await MeetingAttendance.findOne({
      meetingId: meeting._id,
      userId: user._id,
      leaveTime: { $exists: false }
    }).sort({ joinTime: -1 }); 

    if (!log) {
      return res.status(400).json({ error: 'No active join session found' });
    }

    log.leaveTime = new Date();
    await log.save();

    res.status(200).json({ message: 'Leave time recorded', log });
  } catch (error) {
    console.error('Error logging leave time:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/attendance/my', auth, async (req, res) => {
  try {
    const user = req.user;
    const records = await MeetingAttendance.find({ userId: user._id })
      .populate('meetingId', 'meetingType meetingDate meetingTime')
      .sort({ joinTime: -1 });

    res.status(200).json({
      records
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/meeting/attendance/:meetingId', auth, async (req, res) => {
  try {
    const { meetingId } = req.params;

    const records = await MeetingAttendance.find({ meetingId })
      .populate('userId', 'name email')   
      .populate('meetingId', 'meetingType meetingDate meetingTime')
      .sort({ joinTime: 1 }); 

    if (!records || records.length === 0) {
      return res.status(404).json({ message: 'No attendance records found for this meeting' });
    }

    res.status(200).json({
      message: 'Attendance records fetched successfully',
      count: records.length,
      records
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
