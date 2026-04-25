const express = require("express");
const multer = require("multer");
const Payment = require("../models/Payment.model");
const Setting = require("../models/Setting.model");
const User = require("../models/User.model");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

const router = express.Router();

// Use memory storage — no disk writes needed, works on Render/Railway/Vercel
// The image is stored as base64 in MongoDB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const ok = /jpeg|jpg|png|webp|gif/.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error("Images only (jpg, png, webp, gif)"));
  },
});

// ── PUBLIC: wallet addresses shown on checkout page ───────

// GET /api/payments/settings
router.get("/settings", async (req, res) => {
  try {
    const settings = await Setting.find({
      key: {
        $in: ["wallet_btc", "wallet_eth", "wallet_usdt", "wallet_usdt_network"],
      },
    });
    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    res.json(map);
  } catch (e) {
    console.error("[payments/settings]", e.message);
    res.status(500).json({ message: e.message });
  }
});

// ── USER: submit a payment ────────────────────────────────

// POST /api/payments/submit
router.post(
  "/submit",
  protect,
  upload.single("giftCardImage"),
  async (req, res) => {
    try {
      const {
        tier,
        tierLabel,
        tierPrice,
        method,
        cryptoCoin,
        txHash,
        giftCardBrand,
        giftCardAmount,
      } = req.body;

      // Validate tier matches model enum
      const validTiers = ["silver", "gold", "black"];
      if (!validTiers.includes(tier)) {
        return res
          .status(400)
          .json({
            message: `Invalid tier: "${tier}". Must be silver, gold, or black.`,
          });
      }

      // Block duplicate pending submissions for same tier
      const existing = await Payment.findOne({
        userId: req.user._id,
        tier,
        status: "pending",
      });
      if (existing) {
        return res.status(400).json({
          message:
            "You already have a pending payment for this tier. Please wait for it to be reviewed.",
        });
      }

      // Convert uploaded gift card image to base64 if present
      let giftCardImageB64 = "";
      let giftCardImageMime = "";
      if (req.file) {
        giftCardImageB64 = req.file.buffer.toString("base64");
        giftCardImageMime = req.file.mimetype;
      }

      const payment = await Payment.create({
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        tier,
        tierLabel: tierLabel || tier,
        tierPrice,
        method,
        cryptoCoin: cryptoCoin || "",
        txHash: txHash || "",
        giftCardBrand: giftCardBrand || "",
        giftCardAmount: giftCardAmount || "",
        giftCardImage: giftCardImageB64,
        giftCardImageMime,
      });

      // Don't send the full base64 back — just confirm success
      res.status(201).json({
        _id: payment._id,
        tier: payment.tier,
        method: payment.method,
        status: payment.status,
        createdAt: payment.createdAt,
      });
    } catch (e) {
      console.error("[payments/submit]", e.message);
      res.status(500).json({ message: e.message });
    }
  },
);

// GET /api/payments/my — user's own history
router.get("/my", protect, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .select("-giftCardImage -giftCardImageMime") // exclude large base64 from list
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (e) {
    console.error("[payments/my]", e.message);
    res.status(500).json({ message: e.message });
  }
});

// ── ADMIN: review submissions ─────────────────────────────

// GET /api/payments/all
router.get("/all", protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== "all" ? { status } : {};
    const payments = await Payment.find(filter)
      .select("-giftCardImage -giftCardImageMime") // exclude base64 from list view
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (e) {
    console.error("[payments/all]", e.message);
    res.status(500).json({ message: e.message });
  }
});

// GET /api/payments/:id — full single payment including image
router.get("/:id", protect, adminOnly, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Not found" });
    res.json(payment);
  } catch (e) {
    console.error("[payments/:id]", e.message);
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/payments/:id/review — approve or reject
router.put("/:id/review", protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Status must be approved or rejected" });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          adminNote: adminNote || "",
          reviewedAt: new Date(),
          reviewedBy: req.user._id,
        },
      },
      { new: true },
    ).select("-giftCardImage -giftCardImageMime");

    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (status === "approved") {
      await User.findByIdAndUpdate(payment.userId, { membershipActive: true });
    }

    res.json(payment);
  } catch (e) {
    console.error("[payments/review]", e.message);
    res.status(500).json({ message: e.message });
  }
});

// ── ADMIN: wallet settings ────────────────────────────────

// GET /api/payments/admin/settings
router.get("/admin/settings", protect, adminOnly, async (req, res) => {
  try {
    const settings = await Setting.find();
    const map = {};
    settings.forEach((s) => {
      map[s.key] = s.value;
    });
    res.json(map);
  } catch (e) {
    console.error("[payments/admin/settings]", e.message);
    res.status(500).json({ message: e.message });
  }
});

// PUT /api/payments/admin/settings
router.put("/admin/settings", protect, adminOnly, async (req, res) => {
  try {
    const ops = Object.entries(req.body).map(([key, value]) =>
      Setting.findOneAndUpdate(
        { key },
        { $set: { key, value } },
        { upsert: true, new: true },
      ),
    );
    await Promise.all(ops);
    res.json({ message: "Settings saved" });
  } catch (e) {
    console.error("[payments/admin/settings PUT]", e.message);
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
