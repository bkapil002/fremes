const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Agora = require('../Modal/Agora');
const PushedUid = require('../Modal/PushedUid');



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
    const channelName = process.env.CHANNEL_NAME; 
    const appCertificate = process.env.APP_CERTIFICATE;

    if (!appId || !channelName || !appCertificate) {
      return res.status(400).json({ error: 'Missing environment variables' });
    }

    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
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

    const linkId = generateLinkId();

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
    });
  } catch (error) {
    console.error('Token generation failed:', error);
    return res.status(500).json({ error: 'Could not generate token and linkId' });
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
        channelName: agora.channel, // Keep field names consistent
        token: agora.token,
        linkId: agora.linkId,
        uid: rmember,
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
module.exports = router;