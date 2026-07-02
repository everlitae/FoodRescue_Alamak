const express = require("express");
const router = express.Router();
const FoodCategory = require("../models/foodcategory");
const { auth, adminAuth } = require("../middleware/auth");

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Ambil semua kategori makanan aktif
 *     tags: [Categories]
 *     security: []
 *     responses:
 *       200:
 *         description: List kategori berhasil diambil
 */
router.get("/", async (req, res) => {
  try {
    const categories = await FoodCategory.find({ is_active: true }).sort({
      name: 1,
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tambah kategori baru (admin only)
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string, example: "Roti & Pastry" }
 *               slug: { type: string, example: "roti-pastry" }
 *               icon_emoji: { type: string, example: "🥖" }
 *               color_hex: { type: string, example: "#e8b84b" }
 *               description: { type: string }
 *     responses:
 *       201:
 *         description: Kategori berhasil dibuat
 *       400:
 *         description: Slug sudah dipakai
 */
router.post("/", adminAuth, async (req, res) => {
  try {
    const { name, slug, icon_emoji, color_hex, description } = req.body;

    const existing = await FoodCategory.findOne({ slug });
    if (existing) return res.status(400).json({ msg: "Slug sudah dipakai" });

    const category = new FoodCategory({
      name,
      slug,
      icon_emoji,
      color_hex,
      description,
    });
    await category.save();

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update kategori (admin only)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               slug: { type: string }
 *               icon_emoji: { type: string }
 *               color_hex: { type: string }
 *               description: { type: string }
 *               is_active: { type: boolean }
 *     responses:
 *       200:
 *         description: Kategori berhasil diupdate
 *       404:
 *         description: Kategori tidak ditemukan
 */
router.put("/:id", adminAuth, async (req, res) => {
  try {
    const { name, slug, icon_emoji, color_hex, description, is_active } =
      req.body;

    const category = await FoodCategory.findByIdAndUpdate(
      req.params.id,
      { name, slug, icon_emoji, color_hex, description, is_active },
      { new: true },
    );
    if (!category)
      return res.status(404).json({ msg: "Kategori tidak ditemukan" });

    res.json(category);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Hapus kategori (admin only)
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Kategori dihapus
 */
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    await FoodCategory.findByIdAndDelete(req.params.id);
    res.json({ msg: "Kategori dihapus" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/categories/seed:
 *   post:
 *     summary: Seed kategori default (admin only)
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Kategori default berhasil di-seed
 */
router.post("/seed", adminAuth, async (req, res) => {
  try {
    const defaults = [
      {
        name: "Makanan Siap Saji",
        slug: "makanan-siap-saji",
        icon_emoji: "🍚",
      },
      { name: "Roti & Pastry", slug: "roti-pastry", icon_emoji: "🥖" },
      { name: "Sayur & Buah", slug: "sayur-buah", icon_emoji: "🥦" },
      { name: "Minuman", slug: "minuman", icon_emoji: "🥤" },
      { name: "Snack", slug: "snack", icon_emoji: "🍪" },
      { name: "Frozen Food", slug: "frozen-food", icon_emoji: "🧊" },
      { name: "Makanan Bayi", slug: "makanan-bayi", icon_emoji: "👶" },
    ];

    for (const cat of defaults) {
      await FoodCategory.findOneAndUpdate({ slug: cat.slug }, cat, {
        upsert: true,
        new: true,
      });
    }

    res.json({ msg: "Kategori default berhasil di-seed!" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

module.exports = router;