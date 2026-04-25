const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema(
  {
    url:      { type: String, required: true },
    caption:  { type: String, default: '' },
    category: { type: String, default: 'general' }, // for future filtering
    order:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryImage', galleryImageSchema);