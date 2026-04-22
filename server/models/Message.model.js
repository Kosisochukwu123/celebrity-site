const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    // conversationId = userId so each user has one conversation thread
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderName: { type: String, required: true },
    role:       { type: String, enum: ['user', 'admin', 'bot'], required: true },
    text:       { type: String, required: true, maxlength: 2000 },
    read:       { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
