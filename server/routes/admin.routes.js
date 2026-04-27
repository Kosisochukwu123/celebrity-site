const express = require("express");
const multer = require("multer");
const Content = require("../models/Content.model");
const MemberCode = require("../models/MemberCode.model");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

const router = express.Router();

// Memory storage — no disk writes, survives Render restarts
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp|gif/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Images only (jpg, png, webp, gif)"));
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

router.use(protect, adminOnly);

// ── PUT /api/admin/content/:section  (text + optional cover image) ─────────
router.put("/content/:section", upload.single("image"), async (req, res) => {
  try {
    const update = {};
    if (req.body.heading !== undefined) update.heading = req.body.heading;
    if (req.body.subheading !== undefined)
      update.subheading = req.body.subheading;
    if (req.body.body !== undefined) update.body = req.body.body;
    if (req.body.stats) update.stats = JSON.parse(req.body.stats);

    // Convert to base64 data URI — persists in MongoDB, not the filesystem
    if (req.file) {
      const b64 = req.file.buffer.toString("base64");
      update.imageUrl = `data:${req.file.mimetype};base64,${b64}`;
      update.imageMime = req.file.mimetype;
    }

    const content = await Content.findOneAndUpdate(
      { section: req.params.section },
      { $set: update },
      { new: true, upsert: true },
    );

    // Return without the giant base64 string to keep response light
    const out = content.toObject();
    if (out.imageUrl && out.imageUrl.startsWith("data:")) {
      out.imageUrl = "[base64 image stored]";
    }
    res.json({ ...out, imageUrl: content.imageUrl }); // send full for preview
  } catch (e) {
    console.error("[admin/content]", e.message);
    res.status(500).json({ message: e.message });
  }
});

// ── DELETE /api/admin/content/image/:section ──────────────────────────────
router.delete("/content/image/:section", async (req, res) => {
  try {
    await Content.findOneAndUpdate(
      { section: req.params.section },
      { $unset: { imageUrl: "", imageMime: "" } },
    );
    res.json({ message: "Cover image removed" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/admin/content/:section/gallery  (add multiple images) ───────
router.post(
  "/content/:section/gallery",
  upload.array("images", 10),
  async (req, res) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({ message: "No files received" });
      }

      const newImages = req.files.map((f) => ({
        url: `data:${f.mimetype};base64,${f.buffer.toString("base64")}`,
        caption: "",
      }));

      const content = await Content.findOneAndUpdate(
        { section: req.params.section },
        { $push: { images: { $each: newImages } } },
        { new: true, upsert: true },
      );

      res.json(content);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },
);

// ── PATCH /api/admin/content/:section/gallery/:imageId  (edit caption) ────
router.patch("/content/:section/gallery/:imageId", async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { section: req.params.section, "images._id": req.params.imageId },
      { $set: { "images.$.caption": req.body.caption || "" } },
      { new: true },
    );
    res.json(content);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── DELETE /api/admin/content/:section/gallery/:imageId ───────────────────
router.delete("/content/:section/gallery/:imageId", async (req, res) => {
  try {
    await Content.findOneAndUpdate(
      { section: req.params.section },
      { $pull: { images: { _id: req.params.imageId } } },
    );
    res.json({ message: "Image deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── POST /api/admin/codes ─────────────────────────────────────────────────
router.post("/codes", async (req, res) => {
  try {
    const count = Math.min(Number(req.body.count) || 10, 200);
    const codes = Array.from({ length: count }, () => ({
      code: Math.random().toString(36).substring(2, 10).toUpperCase(),
    }));
    const created = await MemberCode.insertMany(codes);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ── GET /api/admin/codes ──────────────────────────────────────────────────
router.get("/codes", async (req, res) => {
  try {
    const codes = await MemberCode.find()
      .sort({ createdAt: -1 })
      .populate("usedBy", "name email");
    res.json(codes);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
