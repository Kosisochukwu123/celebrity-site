const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Event    = require('../models/Event.model');
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `evt-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase());
  ok ? cb(null, true) : cb(new Error('Images only'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } });

// ── PUBLIC ────────────────────────────────────────────────

// GET /api/events  — all upcoming + live events (members access)
router.get('/', protect, async (req, res) => {
  try {
    const events = await Event.find({ status: { $in: ['upcoming', 'live'] } })
      .sort({ featured: -1, date: 1 });
    res.json(events);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/events/all  — all events including past (admin)
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const events = await Event.find().sort({ date: -1 });
    res.json(events);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/events/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── ADMIN CRUD ────────────────────────────────────────────

// POST /api/events  — create event
router.post('/', protect, adminOnly, (req, res) => {
  upload.single('coverImage')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const data = { ...req.body };
      if (req.file) data.coverImage = `/uploads/${req.file.filename}`;
      if (data.highlights) {
        data.highlights = Array.isArray(data.highlights)
          ? data.highlights
          : JSON.parse(data.highlights);
      }
      if (data.capacity) data.capacity = Number(data.capacity);
      const event = await Event.create(data);
      res.status(201).json(event);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });
});

// PUT /api/events/:id  — update event
router.put('/:id', protect, adminOnly, (req, res) => {
  upload.single('coverImage')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const update = { ...req.body };
      if (req.file) {
        // Delete old image
        const old = await Event.findById(req.params.id);
        if (old?.coverImage) {
          const fp = path.join(UPLOADS_DIR, path.basename(old.coverImage));
          if (fs.existsSync(fp)) fs.unlinkSync(fp);
        }
        update.coverImage = `/uploads/${req.file.filename}`;
      }
      if (update.highlights) {
        update.highlights = Array.isArray(update.highlights)
          ? update.highlights
          : JSON.parse(update.highlights);
      }
      if (update.capacity) update.capacity = Number(update.capacity);

      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { $set: update },
        { new: true, runValidators: true }
      );
      if (!event) return res.status(404).json({ message: 'Event not found' });
      res.json(event);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });
});

// DELETE /api/events/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.coverImage) {
      const fp = path.join(UPLOADS_DIR, path.basename(event.coverImage));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;