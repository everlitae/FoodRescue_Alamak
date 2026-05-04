const express = require('express');
const router = express.Router();
const FoodCategory = require('../models/FoodCategory');
const { auth, adminAuth } = require('../middleware/auth');

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await FoodCategory.find({ is_active: true }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/categories
router.post('/', adminAuth, async (req, res) => {
  try {
    const { name, slug, icon_emoji, color_hex, description } = req.body;

    const existing = await FoodCategory.findOne({ slug });
    if (existing) return res.status(400).json({ msg: 'Slug sudah dipakai' });

    const category = new FoodCategory({ name, slug, icon_emoji, color_hex, description });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// PUT /api/categories/:id
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const { name, slug, icon_emoji, color_hex, description, is_active } = req.body;

    const category = await FoodCategory.findByIdAndUpdate(
      req.params.id,
      { name, slug, icon_emoji, color_hex, description, is_active },
      { new: true }
    );
    if (!category) return res.status(404).json({ msg: 'Kategori tidak ditemukan' });

    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// DELETE /api/categories/:id
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    await FoodCategory.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Kategori dihapus' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// POST /api/categories/seed
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const defaults = [
      { name: 'Makanan Siap Saji', slug: 'makanan-siap-saji', icon_emoji: '🍚' },
      { name: 'Roti & Pastry', slug: 'roti-pastry', icon_emoji: '🥖' },
      { name: 'Sayur & Buah', slug: 'sayur-buah', icon_emoji: '🥦' },
      { name: 'Minuman', slug: 'minuman', icon_emoji: '🥤' },
      { name: 'Snack', slug: 'snack', icon_emoji: '🍪' },
      { name: 'Frozen Food', slug: 'frozen-food', icon_emoji: '🧊' },
      { name: 'Makanan Bayi', slug: 'makanan-bayi', icon_emoji: '👶' },
    ];

    for (const cat of defaults) {
      await FoodCategory.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true }
      );
    }

    res.json({ msg: 'Kategori default berhasil di-seed!' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;