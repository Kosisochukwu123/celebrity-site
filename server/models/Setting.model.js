const mongoose = require('mongoose');

// Key-value store for site-wide settings the admin can change
const settingSchema = new mongoose.Schema(
  {
    key:   { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    label: { type: String, default: '' }, // human-readable label for admin UI
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);