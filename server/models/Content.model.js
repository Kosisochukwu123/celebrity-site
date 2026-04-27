const mongoose = require('mongoose');

// Gallery images stored as base64 data URIs — survives server restarts on Render
const imageSchema = new mongoose.Schema({
  url:     { type: String, required: true }, // "data:image/jpeg;base64,..." or legacy "/uploads/..."
  caption: { type: String, default: '' },
}, { _id: true });

const contentSchema = new mongoose.Schema(
  {
    section:    { type: String, required: true, unique: true },
    heading:    { type: String },
    subheading: { type: String },
    body:       { type: String },
    // Cover image stored as base64 data URI — survives server restarts
    imageUrl:   { type: String },
    imageMime:  { type: String, default: 'image/jpeg' },
    images:     { type: [imageSchema], default: [] },
    stats:      [{ label: String, value: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);