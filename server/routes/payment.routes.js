const express  = require('express');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const Payment  = require('../models/Payment.model');
const Setting  = require('../models/Setting.model');
const User     = require('../models/User.model');
const { protect }   = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/admin.middleware');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `pay-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const fileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|webp|gif/.test(path.extname(file.originalname).toLowerCase());
  ok ? cb(null, true) : cb(new Error('Images only'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// ── PUBLIC SETTINGS (wallet addresses etc.) ───────────────

// GET /api/payments/settings  — public wallet config for checkout page
router.get('/settings', async (req, res) => {
  try {
    const settings = await Setting.find({
      key: { $in: ['wallet_btc', 'wallet_eth', 'wallet_usdt', 'wallet_usdt_network'] }
    });
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── USER: Submit a payment ────────────────────────────────

// POST /api/payments/submit
router.post('/submit', protect, (req, res) => {
  upload.single('giftCardImage')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    try {
      const { tier, tierPrice, method, cryptoCoin, txHash, giftCardBrand, giftCardAmount } = req.body;

      // Prevent duplicate pending payments for same tier
      const existing = await Payment.findOne({
        userId: req.user._id,
        tier,
        status: 'pending',
      });
      if (existing) {
        return res.status(400).json({
          message: 'You already have a pending payment for this tier. Please wait for it to be reviewed.',
        });
      }

      const data = {
        userId:    req.user._id,
        userName:  req.user.name,
        userEmail: req.user.email,
        tier, tierPrice, method,
        cryptoCoin:    cryptoCoin    || '',
        txHash:        txHash        || '',
        giftCardBrand: giftCardBrand || '',
        giftCardAmount: giftCardAmount || '',
        giftCardImage: req.file ? `/uploads/${req.file.filename}` : '',
      };

      const payment = await Payment.create(data);
      res.status(201).json(payment);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });
});

// GET /api/payments/my  — user sees their own payment history
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── ADMIN: Review payments ────────────────────────────────

// GET /api/payments/all  — admin sees all payments
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status && status !== 'all' ? { status } : {};
    const payments = await Payment.find(filter).sort({ createdAt: -1 });
    res.json(payments);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/payments/:id/review  — admin approves or rejects
router.put('/:id/review', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status,
          adminNote: adminNote || '',
          reviewedAt: new Date(),
          reviewedBy: req.user._id,
        },
      },
      { new: true }
    );

    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // If approved, activate the user's membership
    if (status === 'approved') {
      await User.findByIdAndUpdate(payment.userId, { membershipActive: true });
    }

    res.json(payment);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── ADMIN: Wallet settings ────────────────────────────────

// GET /api/payments/admin/settings  — all settings
router.get('/admin/settings', protect, adminOnly, async (req, res) => {
  try {
    const settings = await Setting.find();
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json(map);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/payments/admin/settings  — update wallet addresses etc.
router.put('/admin/settings', protect, adminOnly, async (req, res) => {
  try {
    const updates = req.body; // { wallet_btc: '...', wallet_eth: '...', ... }
    const ops = Object.entries(updates).map(([key, value]) =>
      Setting.findOneAndUpdate(
        { key },
        { $set: { key, value } },
        { upsert: true, new: true }
      )
    );
    await Promise.all(ops);
    res.json({ message: 'Settings saved' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;









