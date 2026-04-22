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

// PUT /api/admin/content/:section
router.put("/content/:section", (req, res) => {
  upload.single("image")(req, res, async (multerErr) => {
    if (multerErr instanceof multer.MulterError) {
      return res
        .status(400)
        .json({ message: `Upload error: ${multerErr.message}` });
    }
    if (multerErr) {
      return res.status(400).json({ message: multerErr.message });
    }

    try {
      const update = {};
      if (req.body.heading !== undefined) update.heading = req.body.heading;
      if (req.body.subheading !== undefined)
        update.subheading = req.body.subheading;
      if (req.body.body !== undefined) update.body = req.body.body;
      if (req.body.stats) update.stats = JSON.parse(req.body.stats);
      if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;

      const content = await Content.findOneAndUpdate(
        { section: req.params.section },
        { $set: update },
        { new: true, upsert: true },
      );
      res.json(content);
    } catch (err) {
      console.error("[admin/content] error:", err.message);
      res.status(500).json({ message: err.message });
    }
  });
});

// POST /api/admin/codes
router.post("/codes", async (req, res) => {
  try {
    const count = Math.min(Number(req.body.count) || 10, 200);
    const codes = Array.from({ length: count }, () => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    }));
    const created = await MemberCode.insertMany(codes);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/codes
router.get("/codes", async (req, res) => {
  try {
    const codes = await MemberCode.find()
      .sort({ createdAt: -1 })
      .populate("usedBy", "name email");
    res.json(codes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/admin/content/image/:section  (remove image from a section)
router.delete("/content/image/:section", async (req, res) => {
  try {
    const doc = await Content.findOne({ section: req.params.section });
    if (doc?.imageUrl) {
      const filePath = path.join(UPLOADS_DIR, path.basename(doc.imageUrl));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await Content.findOneAndUpdate(
      { section: req.params.section },
      { $unset: { imageUrl: "" } },
    );
    res.json({ message: "Image removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
