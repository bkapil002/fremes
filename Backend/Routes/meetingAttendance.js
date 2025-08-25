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
    const joinTime = dayjs(); 

    const meeting = await Agora.findOne({ linkId });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
    if (meeting.user._id.toString() === user._id.toString()) { return res.status(200).json({ message: 'Creator join ignored' }); }

    const meetingDate = dayjs(meeting.meetingDate).format('YYYY-MM-DD'); 
    const joinDate = joinTime.format('YYYY-MM-DD');

    if (joinDate !== meetingDate) {
      return res.status(400).json({ message: 'You can join only on the meeting date' });
    }

    const [startStr, endStr] = meeting.meetingTime.split(' - '); 
    const startTime = dayjs(`${meetingDate} ${startStr}`, 'YYYY-MM-DD h:mm A');
    const endTime = dayjs(`${meetingDate} ${endStr}`, 'YYYY-MM-DD h:mm A');

    if (joinTime.isBefore(startTime) || joinTime.isAfter(endTime)) {
      return res.status(400).json({ message: 'Attendance allowed only during meeting time' });
    }

    const attendance = new MeetingAttendance({
      meetingId: meeting._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      meetingType: meeting.meetingType,
      meetingTime: meeting.meetingTime,
      meetingDate: meeting.meetingDate,
      joinTime: joinTime.toISOString()
    });

    await attendance.save();

    res.status(200).json({ message: 'Attendance marked successfully', attendance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/meeting/leave/:linkId', auth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const user = req.user;
    const leaveTime = dayjs();
   
    // Find meeting by linkId
    const meeting = await Agora.findOne({ linkId });
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }
     if (meeting.user._id.toString() === user._id.toString()) { return res.status(200).json({ message: 'Creator leave ignored' }); }
    let attendance = await MeetingAttendance.findOne({
      meetingId: meeting._id,
      userId: user._id,
      leaveTime: { $exists: false } 
    }).sort({ joinTime: -1 });

    if (!attendance) {
      return res.status(400).json({ message: 'No active attendance found. Join first.' });
    }

    attendance.leaveTime = leaveTime.toISOString();
    await attendance.save();

    res.status(200).json({
      message: 'Leave time recorded successfully',
      attendance
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
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
