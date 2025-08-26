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

    if (meeting.user._id.toString() === user._id.toString()) {
      return res.status(200).json({ message: 'Creator join ignored' });
    }

    const meetingDate = dayjs(meeting.meetingDate).format('YYYY-MM-DD');
    const joinDate = joinTime.format('YYYY-MM-DD');

    console.log('Date validation:', { meetingDate, joinDate });

    if (joinDate !== meetingDate) {
      return res.status(400).json({ message: 'You can join only on the meeting date' });
    }

    // Enhanced time validation with better error handling
    const [startStr, endStr] = meeting.meetingTime.split(' - ');
    
    console.log('Meeting time parts:', { startStr, endStr, meetingTime: meeting.meetingTime });

    // Parse times with better format handling
    let startTime, endTime;
    
    try {
      // Try different time formats
      startTime = dayjs(`${meetingDate} ${startStr}`, ['YYYY-MM-DD h:mm A', 'YYYY-MM-DD HH:mm']);
      endTime = dayjs(`${meetingDate} ${endStr}`, ['YYYY-MM-DD h:mm A', 'YYYY-MM-DD HH:mm']);
      

      if (!startTime.isValid()) {
        startTime = dayjs(startStr, ['h:mm A', 'HH:mm']);
        startTime = dayjs(`${meetingDate} ${startTime.format('HH:mm')}`);
      }
      
      if (!endTime.isValid()) {
        endTime = dayjs(endStr, ['h:mm A', 'HH:mm']);
        endTime = dayjs(`${meetingDate} ${endTime.format('HH:mm')}`);
      }
    } catch (error) {
      console.error('Error parsing meeting times:', error);
      return res.status(500).json({ message: 'Invalid meeting time format' });
    }

    console.log('Time validation details:', {
      currentTime: joinTime.format('YYYY-MM-DD HH:mm:ss'),
      meetingStart: startTime.format('YYYY-MM-DD HH:mm:ss'),
      meetingEnd: endTime.format('YYYY-MM-DD HH:mm:ss'),
      startTimeValid: startTime.isValid(),
      endTimeValid: endTime.isValid(),
      isBeforeStart: joinTime.isBefore(startTime),
      isAfterEnd: joinTime.isAfter(endTime)
    });

    if (!startTime.isValid() || !endTime.isValid()) {
      return res.status(500).json({ message: 'Invalid meeting time format in database' });
    }

 
    if (joinTime.isBefore(startTime) || joinTime.isAfter(endTime)) {
      return res.status(400).json({ 
        message: 'Attendance allowed only during meeting time',
        details: {
          currentTime: joinTime.format('h:mm A'),
          meetingTime: `${startTime.format('h:mm A')} - ${endTime.format('h:mm A')}`,
          timeUntilStart: startTime.diff(joinTime, 'minutes'),
          timeSinceEnd: joinTime.diff(endTime, 'minutes')
        }
      });
    }

    // Check if user already has an active attendance record
    const existingAttendance = await MeetingAttendance.findOne({
      meetingId: meeting._id,
      userId: user._id,
      leaveTime: { $exists: false }
    });

    if (existingAttendance) {
      console.log('User already has active attendance:', existingAttendance._id);
      return res.status(200).json({ 
        message: 'Already joined', 
        attendance: existingAttendance 
      });
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
    console.error('Join endpoint error:', error);
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
