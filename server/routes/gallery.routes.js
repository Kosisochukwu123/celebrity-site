const express      = require('express');
const multer       = require('multer');
const GalleryImage = require('../models/GalleryImage.model');
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

// Memory storage — images saved as base64 in MongoDB, no disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp|gif/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Images only'));
  },
});

// Helper — build data URI from a GalleryImage document
const toDataUri = (doc) => `data:${doc.mime};base64,${doc.data}`;

// GET /api/gallery — members only, returns data URIs
router.get('/', protect, async (req, res) => {
  try {
    const images = await GalleryImage.find()
      .sort({ order: 1, createdAt: -1 });
    // Return data URIs so client can display without a separate request
    res.json(images.map(img => ({
      _id:     img._id,
      url:     toDataUri(img),
      caption: img.caption,
      order:   img.order,
      sizeKb:  img.sizeKb,
      createdAt: img.createdAt,
    })));
  } catch (e) { 
    console.error('[gallery/GET]', e.message);
    res.status(500).json({ message: e.message }); 
  }
});

// POST /api/gallery/upload — admin, up to 20 images
router.post('/upload', protect, adminOnly, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files?.length) return res.status(400).json({ message: 'No files received' });

    const maxOrderDoc = await GalleryImage.findOne().sort({ order: -1 }).select('order');
    let nextOrder = (maxOrderDoc?.order ?? -1) + 1;

    const docs = req.files.map(f => ({
      data:    f.buffer.toString('base64'),
      mime:    f.mimetype,
      caption: '',
      order:   nextOrder++,
      sizeKb:  Math.round(f.size / 1024),
    }));

    const created = await GalleryImage.insertMany(docs);

    res.status(201).json(created.map(img => ({
      _id:     img._id,
      url:     toDataUri(img),
      caption: img.caption,
      order:   img.order,
      sizeKb:  img.sizeKb,
      createdAt: img.createdAt,
    })));
  } catch (e) {
    console.error('[gallery/upload]', e.message);
    res.status(500).json({ message: e.message });
  }
});

// PATCH /api/gallery/:id — update caption or order
router.patch('/:id', protect, adminOnly, async (req, res) => {
  try {
    const update = {};
    if (req.body.caption !== undefined) update.caption = req.body.caption;
    if (req.body.order   !== undefined) update.order   = Number(req.body.order);
    const img = await GalleryImage.findByIdAndUpdate(
      req.params.id, { $set: update }, { new: true }
    );
    if (!img) return res.status(404).json({ message: 'Not found' });
    res.json({ _id: img._id, caption: img.caption, order: img.order });
  } catch (e) { 
    console.error('[gallery/patch]', e.message);
    res.status(500).json({ message: e.message }); 
  }
});

// DELETE /api/gallery/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const img = await GalleryImage.findById(req.params.id);
    if (!img) return res.status(404).json({ message: 'Not found' });
    await img.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { 
    console.error('[gallery/delete]', e.message);
    res.status(500).json({ message: e.message }); 
  }
});

// POST /api/gallery/bulk-delete
router.post('/bulk-delete', protect, adminOnly, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids?.length) return res.status(400).json({ message: 'No IDs provided' });
    const result = await GalleryImage.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${result.deletedCount} images deleted` });
  } catch (e) { 
    console.error('[gallery/bulk-delete]', e.message);
    res.status(500).json({ message: e.message }); 
  }
});

module.exports = router;