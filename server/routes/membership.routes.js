const express = require('express');
const User = require('../models/User.model');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// GET /api/membership/status
router.get('/status', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('membershipActive name email');
  res.json(user);
});

// POST /api/membership/activate  (payment integration goes here later)
router.post('/activate', protect, async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { membershipActive: true });
  res.json({ message: 'Membership activated' });
});

module.exports = router;
