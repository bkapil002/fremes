const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Agora = require('../Modal/Agoraa');
const PushedUid = require('../Modal/PushedUid');
const PromotedUid = require('../Modal/PromotedUid');


function generateLinkId() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segmentLengths = [4, 5, 4];
  return segmentLengths
    .map(len =>
      Array.from({ length: len }, () =>
        characters.charAt(Math.floor(Math.random() * characters.length))
      ).join('')
    ).join('-');
}


router.post('/create-room', auth, async (req, res) => {
  try {
    const appId = process.env.APP_ID;
    const appCertificate = process.env.APP_CERTIFICATE;

    if (!appId || !appCertificate) {
      return res.status(400).json({ error: 'Missing environment variables' });
    }
     
    const { meetingType, meetingDate, meetingTime } = req.body;

     if (!meetingType || !meetingDate || !meetingTime) {
      return res.status(400).json({ error: 'Meeting type, date, and time are required' });
    }
    const linkId = generateLinkId();
    const channelName = linkId; 

    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 691200 ; 
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      privilegeExpiredTs
    );


    const agora = await Agora.create({
      token,
      linkId,
      appId,
      channel: channelName,
      user: {
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        imageUrls:req.user.imageUrls
      },
      meetingType,
      meetingDate:new Date(meetingDate),
      meetingTime
    });

    return res.status(200).json({
      token,
      linkId,
      appId,
      channelName,
      uid,
      user: {
        _id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        mageUrls:req.user.imageUrls
      },
      meetingType,
      meetingDate,
      meetingTime
    });
  } catch (error) {
    console.error('Token generation failed:', error);
    return res.status(500).json({ error: 'Could not generate token and linkId' });
  }
}); 

router.delete('/delete-room/:linkId', auth, async (req, res) => {
  try {
    const { linkId } = req.params;

    if (!linkId) {
      return res.status(400).json({ error: 'Link ID is required' });
    }

    const room = await Agora.findOne({ linkId });

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this room' });
    }

    await Agora.deleteOne({ linkId });

    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Could not delete room' });
  }
});

router.get('/rooms', auth, async (req, res) => {
  try {
    const rooms = await Agora.find({ "user._id": req.user._id })
      .sort({ createdAt: -1 }); 

    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Could not fetch rooms' });
  }
});

router.get('/meeting-time/:meetingDate', auth, async (req, res) => {
  try {
    const { meetingDate } = req.params;

    if (!meetingDate) {
      return res.status(400).json({ error: 'Meeting date is required' });
    }

    const startOfDay = new Date(meetingDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(meetingDate);
    endOfDay.setHours(23, 59, 59, 999);

    const meetings = await Agora.find({
      meetingDate: { $gte: startOfDay, $lte: endOfDay }
    }).select('meetingTime -_id');

    const bookedTimes = meetings.map(m => m.meetingTime);

    return res.status(200).json({
      date: meetingDate,
      bookedTimes
    });

  } catch (error) {
    console.error('Error fetching meeting times:', error);
    return res.status(500).json({ error: 'Could not fetch meeting times' });
  }
});



router.get('/all-rooms', auth, async (req, res) => {
  try {
    const rooms = await Agora.find().sort({ createdAt: -1 }); 
    res.status(200).json(rooms);
  } catch (error) {
    console.error('Error fetching all rooms:', error);
    res.status(500).json({ error: 'Could not fetch rooms' });
  }
});


router.put('/join-room/:linkId', auth, async (req, res) => {
  try {
    const { linkId } = req.params;
    const rmember = req.user._id.toString();

    if (!linkId) {
      return res.status(400).json({ error: 'linkId is required' });
    }

    const agora = await Agora.findOne({ linkId });

    if (!agora) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.status(200).json({
      rmember,
      agora: {
        appId: agora.appId,
        channelName: agora.channel, 
        token: agora.token,
        linkId: agora.linkId,
        uid: rmember,
        meetingType:agora.meetingType,
        meetingDate:agora.meetingDate,
        meetingTime:agora.meetingTime,
        user: {
          _id: agora.user._id,
          email: agora.user.email,
          name: agora.user.name,
          imageUrls:agora.user.imageUrls
        },
      },
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return res.status(500).json({ error: 'Could not join room' });
  }
});


router.post('/push-uid', auth, async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  try {
    const exists = await PushedUid.exists({ uid: email });
    if (exists) return res.status(409).json({ error: 'UID already pushed' });

    const pushed = new PushedUid({ uid: email, ts: Date.now() });
    await pushed.save();
    res.status(201).json({ success: true, uid: email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/is-uid-pushed/:uid', auth, async (req, res) => {
  const { uid } = req.params;
  try {
    const exists = await PushedUid.exists({ uid });
    res.json({ pushed: !!exists });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/pushed-uids', auth, async (req, res) => {
  try {
    const pushedUids = await PushedUid.find({}, { _id: 0, uid: 1, ts: 1 });
    res.json(pushedUids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/unpush-uid/:uid', auth, async (req, res) => {
  try {
    const uid = req.params.uid || req.user.email;
    await PushedUid.deleteOne({ uid });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/promote-uid/:roomId', auth, async (req, res) => {
  const { uid } = req.body;
  const { roomId } = req.params;
  if (!uid || !roomId) return res.status(400).json({ error: 'uid and roomId are required' });

  try {
  
    await PromotedUid.deleteMany({ roomId });

    
    const promoted = new PromotedUid({ roomId, uid, ts: Date.now() });
    await promoted.save();
    res.status(201).json({ success: true, uid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.delete('/promote-uid/:roomId', auth, async (req, res) => {
  const { roomId } = req.params;
  try {
    await PromotedUid.deleteMany({ roomId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/promote-uid/:roomId', auth, async (req, res) => {
  const { roomId } = req.params;
  try {
    const promoted = await PromotedUid.findOne({ roomId });
    res.json({ promotedUid: promoted ? promoted.uid : null, ts: promoted ? promoted.ts : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;