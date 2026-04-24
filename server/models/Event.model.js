const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, trim: true },
    subtitle:    { type: String, default: '' },
    description: { type: String, default: '' },
    date:        { type: Date,   required: true },   // the event date/time
    timezone:    { type: String, default: 'UTC' },    // display timezone label e.g. "GMT+1 (Lagos)"
    venue:       { type: String, default: '' },
    city:        { type: String, default: '' },
    country:     { type: String, default: '' },
    mapUrl:      { type: String, default: '' },       // Google Maps embed or link
    category:    { type: String, enum: ['gala', 'forum', 'summit', 'screening', 'fundraiser', 'other'], default: 'other' },
    coverImage:  { type: String, default: '' },       // /uploads/filename
    ticketUrl:   { type: String, default: '' },
    ticketPrice: { type: String, default: '' },       // e.g. "Free for members"
    capacity:    { type: Number, default: 0 },
    featured:    { type: Boolean, default: false },   // shown as hero/primary event
    status:      { type: String, enum: ['upcoming', 'live', 'past', 'cancelled'], default: 'upcoming' },
    highlights:  [{ type: String }],                  // bullet point highlights
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);