const express = require('express');
const router = express.Router();
const RemovedUser  = require('../Modal/RemovedUser');
const { auth } = require('../middleware/auth');


router.post('/remove-user', auth, async (req, res) => {
    try {
        const { uid, name, meetingType, meetingTime, linkId, adminName, admin } = req.body;
        if (!uid || !name || !meetingType || !meetingTime || !linkId || !adminName || !admin) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const removedUser = new RemovedUser({
            uid,
            name,
            meetingType,
            meetingTime,
            linkId,
            adminName,
            admin
        });
        await removedUser.save();
        return res.status(201).json({
            message: 'User removed and data stored successfully',
            data: removedUser
        });

    } catch (error) {
        console.error('Error removing user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

router.get('/user-removed/:linkId', auth, async (req, res) => {
    try {
        const { linkId } = req.params;
        if (!linkId) {
            return res.status(400).json({ message: 'Meeting linkId is required' });
        }
        const removedUsers = await RemovedUser.find({ linkId }).sort({ createdAt: -1 });
        // Return array of UIDs
        return res.status(200).json({
            data: removedUsers.map(user => user.uid)
        });
    } catch (error) {
        console.error('Error fetching removed users:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;