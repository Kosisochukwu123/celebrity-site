const mongoose = require('mongoose');


const galleryImageSchema = new mongoose.Schema(
  {
    // Store as base64 to avoid ephemeral filesystem issues on Render/Railway
    data:     { type: String, required: true }, // base64 encoded image
    mime:     { type: String, required: true }, // e.g. 'image/jpeg'
    caption:  { type: String, default: '' },
    order:    { type: Number, default: 0 },
    sizeKb:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryImage', galleryImageSchema);