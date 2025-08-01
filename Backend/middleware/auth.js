require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../Modal/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json({ error: 'Admin access required' });
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};

module.exports = { auth, adminAuth };
