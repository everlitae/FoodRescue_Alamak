const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { auth } = require("../middleware/auth");

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Ambil profil lengkap user login
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profil berhasil diambil
 *       404:
 *         description: User tidak ditemukan
 */
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update profil user login
 *     tags: [Users]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               username: { type: string }
 *               phone: { type: string }
 *               city: { type: string }
 *               bio: { type: string }
 *     responses:
 *       200:
 *         description: Profil berhasil diperbarui
 *       400:
 *         description: Username sudah dipakai
 *       404:
 *         description: User tidak ditemukan
 */
router.put("/profile", auth, async (req, res) => {
  try {
    const { first_name, last_name, username, phone, city, bio } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    if (first_name) user.first_name = first_name;
    if (last_name !== undefined) user.last_name = last_name;
    if (phone !== undefined) user.phone = phone || undefined;
    if (city !== undefined) user.city = city;

    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing)
        return res.status(400).json({ msg: "Username sudah dipakai" });
      user.username = username;
    }

    if (bio !== undefined) {
      if (!user.profile) user.profile = {};
      user.profile.bio = bio;
    }

    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/users/change-password:
 *   put:
 *     summary: Ganti password user login
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Password berhasil diubah
 *       400:
 *         description: Password lama salah
 *       404:
 *         description: User tidak ditemukan
 */
router.put("/change-password", auth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select("+password_hash");
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return res.status(400).json({ msg: "Password lama salah" });

    user.password_hash = newPassword;
    await user.save();

    res.json({ msg: "Password berhasil diubah" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Ambil profil publik seorang user
 *     tags: [Users]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Profil publik berhasil diambil
 *       404:
 *         description: User tidak ditemukan
 */
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "first_name last_name username avatar_url role city trust_score total_points profile created_at",
    );
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;