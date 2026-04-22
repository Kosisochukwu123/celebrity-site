const express = require('express');
const Message = require('../models/Message.model');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

// GET /api/chat/history  — user fetches their own conversation
router.get('/history', protect, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.user._id.toString() })
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/conversations  — admin sees all open conversations
router.get('/conversations', protect, adminOnly, async (req, res) => {
  try {
    // Get the latest message per conversationId
    const convos = await Message.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$text' },
          lastRole:    { $first: '$role' },
          lastTime:    { $first: '$createdAt' },
          senderName:  { $first: '$senderName' },
          unread: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$role', 'user'] }, { $eq: ['$read', false] }] }, 1, 0]
            }
          }
        }
      },
      { $sort: { lastTime: -1 } }
    ]);
    res.json(convos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/chat/conversation/:userId  — admin reads a specific user's messages
router.get('/conversation/:userId', protect, adminOnly, async (req, res) => {
  try {
    const messages = await Message.find({ conversationId: req.params.userId })
      .sort({ createdAt: 1 })
      .limit(200);

    // Mark user messages as read
    await Message.updateMany(
      { conversationId: req.params.userId, role: 'user', read: false },
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
