const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const MemberCode = require("../models/MemberCode.model");
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

// console.log("AUTH ROUTES LOADED");

const router = express.Router();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, membershipCode } = req.body;

    if (!name || !email || !password || !membershipCode) {
      return res
        .status(400)
        .json({ message: "All fields including membership code are required" });
    }

    const code = await MemberCode.findOne({
      code: membershipCode.toUpperCase(),
      used: false,
    });

    if (!code) {
      return res
        .status(400)
        .json({ message: "Invalid or already used membership code" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      membershipCode: code.code,
    });

    code.used = true;
    code.usedBy = user._id;
    await code.save();

    res.status(201).json({
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err); // 👈 add this for debugging
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({
      token: signToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/address
router.get('/address', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('address name email');
    res.json(user.address || {});
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/auth/address
router.put('/address', protect, async (req, res) => {
  try {
    const allowed = ['fullName','phone','line1','line2','city','state','postalCode','country'];
    const update = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) update[`address.${f}`] = req.body[f]; });
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: update },
      { new: true }
    ).select('address');
    res.json(user.address);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/users — admin: list all users with address + membership info
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role membershipActive address createdAt')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/users/:id/address — admin: get one user's delivery address
router.get('/users/:id/address', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email address membershipActive');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;