const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Content = require("../models/Content.model");
const MemberCode = require("../models/MemberCode.model");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

const router = express.Router();

// Ensure uploads directory always exists on startup
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const okExt = allowed.test(path.extname(file.originalname).toLowerCase());
  const okMime = allowed.test(file.mimetype);
  if (okExt && okMime) return cb(null, true);
  cb(new Error("Only image files allowed: jpg, png, gif, webp"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// All admin routes require auth + admin role
router.use(protect, adminOnly);


// ── PUT /api/admin/content/:section  (cover image + text) ─
router.put('/content/:section', (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
    if (err) return res.status(400).json({ message: err.message });
    try {
      const update = {};
      if (req.body.heading    !== undefined) update.heading    = req.body.heading;
      if (req.body.subheading !== undefined) update.subheading = req.body.subheading;
      if (req.body.body       !== undefined) update.body       = req.body.body;
      if (req.body.stats)                    update.stats      = JSON.parse(req.body.stats);
      if (req.file)                          update.imageUrl   = `/uploads/${req.file.filename}`;

      const content = await Content.findOneAndUpdate(
        { section: req.params.section },
        { $set: update },
        { new: true, upsert: true }
      );
      res.json(content);
    } catch (e) {
      console.error('[admin/content]', e.message);
      res.status(500).json({ message: e.message });
    }
  });
});

// ── DELETE /api/admin/content/image/:section  (remove cover) ─
router.delete('/content/image/:section', async (req, res) => {
  try {
    const doc = await Content.findOne({ section: req.params.section });
    if (doc?.imageUrl) {
      const fp = path.join(UPLOADS_DIR, path.basename(doc.imageUrl));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await Content.findOneAndUpdate({ section: req.params.section }, { $unset: { imageUrl: '' } });
    res.json({ message: 'Cover image removed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── POST /api/admin/content/:section/gallery  (add images) ─
router.post('/content/:section/gallery', (req, res) => {
  upload.array('images', 10)(req, res, async (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
    if (err) return res.status(400).json({ message: err.message });
    if (!req.files?.length) return res.status(400).json({ message: 'No files received' });

    try {
      const newImages = req.files.map(f => ({
        url:     `/uploads/${f.filename}`,
        caption: '',
      }));
      const content = await Content.findOneAndUpdate(
        { section: req.params.section },
        { $push: { images: { $each: newImages } } },
        { new: true, upsert: true }
      );
      res.json(content);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
});

// ── PATCH /api/admin/content/:section/gallery/:imageId  (edit caption) ─
router.patch('/content/:section/gallery/:imageId', async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { section: req.params.section, 'images._id': req.params.imageId },
      { $set: { 'images.$.caption': req.body.caption || '' } },
      { new: true }
    );
    res.json(content);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── DELETE /api/admin/content/:section/gallery/:imageId  (remove one) ─
router.delete('/content/:section/gallery/:imageId', async (req, res) => {
  try {
    const doc = await Content.findOne({ section: req.params.section });
    if (!doc) return res.status(404).json({ message: 'Section not found' });

    const img = doc.images.id(req.params.imageId);
    if (img) {
      const fp = path.join(UPLOADS_DIR, path.basename(img.url));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }

    await Content.findOneAndUpdate(
      { section: req.params.section },
      { $pull: { images: { _id: req.params.imageId } } }
    );
    res.json({ message: 'Image deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── POST /api/admin/codes ──────────────────────────────────
router.post('/codes', async (req, res) => {
  try {
    const count = Math.min(Number(req.body.count) || 10, 200);
    const codes = Array.from({ length: count }, () => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    }));
    const created = await MemberCode.insertMany(codes);
    res.status(201).json(created);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── GET /api/admin/codes ───────────────────────────────────
router.get('/codes', async (req, res) => {
  try {
    const codes = await MemberCode.find().sort({ createdAt: -1 }).populate('usedBy', 'name email');
    res.json(codes);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
