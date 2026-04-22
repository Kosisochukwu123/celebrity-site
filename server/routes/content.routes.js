const express = require('express');
const Content = require('../models/Content.model');
const router = express.Router();

// GET /api/content  — public
router.get('/', async (req, res) => {
  try {
    const content = await Content.find();
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/content/:section
router.get('/:section', async (req, res) => {
  try {
    const content = await Content.findOne({ section: req.params.section });
    if (!content) return res.status(404).json({ message: 'Section not found' });
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
