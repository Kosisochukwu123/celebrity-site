const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    caption: { type: String, default: "" },
  },
  { _id: true },
);

const contentSchema = new mongoose.Schema(
  {
    section: { type: String, required: true, unique: true },
    heading: { type: String },
    subheading: { type: String },
    body: { type: String },
    imageUrl: { type: String }, // hero / cover image (single)
    images: { type: [imageSchema], default: [] }, // gallery (multiple)
    stats: [{ label: String, value: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Content", contentSchema);
