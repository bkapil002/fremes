const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Agora = require('../Modal/Agoraa');
const PushedUid = require('../Modal/PushedUid');
const PromotedUid = require('../Modal/PromotedUid');
const cron = require("node-cron");
const dayjs = require('dayjs');
const appId = process.env.APP_ID;
const appCertificate = process.env.APP_CERTIFICATE;
const emailServer = require('../Emailserver/emailServer')
const createMettingTemplate  = require('../MailTemplate/createMettingTemplate')

async function refreshTokens() {
  try {
    if (!appId || !appCertificate) {
      console.error("Missing APP_ID or APP_CERTIFICATE");
      return;
    }

    console.log("Running token refresh...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 8);

    const meetings = await Agora.find({
      meetingDate: { $gte: today, $lte: endDate }
    });

    for (const meeting of meetings) {
      const uid = 0;
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 86400;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const newToken = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        meeting.channel,
        uid,
        role,
        privilegeExpiredTs 
      );

      meeting.token = newToken;
      await meeting.save();
    }
     
    console.log(`✅Updated tokens for ${meetings.length} meetings.`);
  } catch (err) {
    console.error("Error updating tokens:", err);
  }
}

function startTokenCron() {
  refreshTokens(); 
  cron.schedule("0 0 * * *", refreshTokens); 
}

function getNthWeekdayOfMonth(baseDate, monthsToAdd = 1) {
  const date = new Date(baseDate);

  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  const nth = Math.ceil(dayOfMonth / 7);

  const targetMonth = date.getMonth() + monthsToAdd;
  const targetYear = date.getFullYear() + Math.floor(targetMonth / 12);
  const normalizedMonth = targetMonth % 12;

  const firstDay = new Date(targetYear, normalizedMonth, 1);
  let offset = (dayOfWeek - firstDay.getDay() + 7) % 7;
  let targetDate = 1 + offset + (nth - 1) * 7;


  const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
  if (targetDate > lastDay) {
    targetDate -= 7; 
  }

  return new Date(targetYear, normalizedMonth, targetDate);
}



router.post('/create-room', auth, async (req, res) => {
  try {
    if (!appId || !appCertificate) {
      return res.status(400).json({ error: 'Missing environment variables' });
    }

    const { meetingType, meetingDate, meetingTime, meetingRepeat,meetingDescription } = req.body;

    if (!meetingType || !meetingDate || !meetingTime || !meetingDescription) {
      return res.status(400).json({ error: 'Meeting type, date, and time are required' });
    }

    const startDate = dayjs(meetingDate);

    const recurrence = {
      repeatType: meetingRepeat,
      interval: 1,
      batchSize: 5
    };

    const loopCount = meetingRepeat === "Does not repeat" ? 1 : recurrence.batchSize;

    const meetingsToCreate = [];

    for (let i = 0; i < loopCount; i++) {
      let dateToUse = startDate;

      if (meetingRepeat === "Daily") {
        dateToUse = startDate.add(i * recurrence.interval, "day");
      } else if (meetingRepeat === "Weekly") {
        dateToUse = startDate.add(i * recurrence.interval, "week");
      } else if (meetingRepeat === "Monthly") {
        dateToUse = dayjs(getNthWeekdayOfMonth(startDate.toDate(), i * recurrence.interval));
      }
      
        const formattedDate = dayjs(dateToUse).format("DD-MM-YYYY");


       const safeType = meetingType.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();


       const safeTime = meetingTime
    .replace(/\s+/g, "")            
    .replace(/:/g, "")              
    .replace(/[^a-zA-Z0-9-]/g, "")  
    .toLowerCase();


  const linkId = `${safeType}-${formattedDate}-${safeTime}`;
      const channelName = linkId;

      const uid = 0;
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 86400;
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
          imageUrls: req.user.imageUrls
        },
        meetingType,
        meetingDate: dateToUse.toDate(),
        meetingTime,
        meetingDescription,
        meetingRepeat,
        recurrence
      });

      meetingsToCreate.push(agora);
    }
    const subject = `You joined a meeting: ${meetingType}`;
          const html = createMettingTemplate(
        req.user.name,
        meetingType,
         meetingRepeat,
        `https://samzra.onrender.com/room/${meetingsToCreate[0].linkId}` // meeting link
        );
      await emailServer.sendEmail(req.user.email, subject, html);
    return res.status(200).json({
      meetings: meetingsToCreate
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




router.delete('/delete-upcoming/:linkId', auth, async (req, res) => {
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
      return res.status(403).json({ error: 'Not authorized to delete these meetings' });
    }


    const today = new Date();
    await Agora.deleteMany({
      "user._id": req.user._id,
      meetingType: room.meetingType,
      meetingDate: { $gte: today }
    });

    await Agora.updateMany(
      {
        "user._id": req.user._id,
        meetingType: room.meetingType
      },
      { $unset: { recurrence: "" } }
    );

    res.status(200).json({ 
      message: 'Upcoming meetings deleted and recurrence stopped' 
    });
  } catch (error) {
    console.error('Error deleting upcoming meetings:', error);
    res.status(500).json({ error: 'Could not delete upcoming meetings' });
  }
});

router.get('/Upcomeing-rooms', auth, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const rooms = await Agora.find({
      "user._id": req.user._id,
      meetingDate: { $gte: today }   
    }).sort({ meetingDate: 1 }); 

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching rooms:", error);
    res.status(500).json({ error: "Could not fetch rooms" });
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



router.get('/all-rooms' , async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const rooms = await Agora.find({
      meetingDate: { $gte: today }   
    }).sort({ meetingDate: 1 });     

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching all upcoming rooms:", error);
    res.status(500).json({ error: "Could not fetch upcoming rooms" });
  }
});


router.get('/today/all-rooms', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // start of tomorrow

    const rooms = await Agora.find(
      { meetingDate: { $gte: today, $lt: tomorrow } },
      "meetingType meetingDate meetingTime  linkId" // <-- only select these fields
    ).sort({ meetingDate: 1 });

    res.status(200).json(rooms);
  } catch (error) {
    console.error("Error fetching today's upcoming rooms:", error);
    res.status(500).json({ error: "Could not fetch today's meetings" });
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
        meetingDescription:agora.meetingDescription,
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

module.exports = { router, startTokenCron };