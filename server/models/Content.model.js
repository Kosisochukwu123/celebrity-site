const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true },
    heading: { type: String },
    subheading: { type: String },
    body: { type: String },
    imageUrl: { type: String },
    stats: [{ label: String, value: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Content', contentSchema);
