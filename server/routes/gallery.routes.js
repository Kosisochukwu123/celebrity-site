const express      = require('express');
const multer       = require('multer');
const path         = require('path');
const fs           = require('fs');
const GalleryImage = require('../models/GalleryImage.model');
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `gallery-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|webp|gif/.test(path.extname(file.originalname).toLowerCase());
  ok ? cb(null, true) : cb(new Error('Images only'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 15 * 1024 * 1024 } });

// GET /api/gallery  — members only
router.get('/', protect, async (req, res) => {
  try {
    const images = await GalleryImage.find().sort({ order: 1, createdAt: -1 });
    res.json(images);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/gallery/upload  — admin: upload up to 20 images at once
router.post('/upload', protect, adminOnly, (req, res) => {
  upload.array('images', 20)(req, res, async (err) => {
    if (err instanceof multer.MulterError) return res.status(400).json({ message: err.message });
    if (err) return res.status(400).json({ message: err.message });
    if (!req.files?.length) return res.status(400).json({ message: 'No files received' });

    try {
      const maxOrder = await GalleryImage.findOne().sort({ order: -1 }).select('order');
      let nextOrder = (maxOrder?.order ?? -1) + 1;

      const docs = req.files.map(f => ({
        url:     `/uploads/${f.filename}`,
        caption: '',
        order:   nextOrder++,
      }));
      const created = await GalleryImage.insertMany(docs);
      res.status(201).json(created);
    } catch (e) { res.status(500).json({ message: e.message }); }
  });
});

// PATCH /api/gallery/:id  — update caption or order
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const update = {};
    if (req.body.caption !== undefined) update.caption = req.body.caption;
    if (req.body.order   !== undefined) update.order   = Number(req.body.order);
    const img = await GalleryImage.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!img) return res.status(404).json({ message: 'Image not found' });
    res.json(img);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/gallery/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const img = await GalleryImage.findById(req.params.id);
    if (!img) return res.status(404).json({ message: 'Image not found' });
    const fp = path.join(UPLOADS_DIR, path.basename(img.url));
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
    await img.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/gallery/bulk  — delete multiple
router.post('/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ message: 'No IDs provided' });
    const images = await GalleryImage.find({ _id: { $in: ids } });
    images.forEach(img => {
      const fp = path.join(UPLOADS_DIR, path.basename(img.url));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    });
    await GalleryImage.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${images.length} images deleted` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;