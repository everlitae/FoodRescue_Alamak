const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { auth } = require("../middleware/auth");

/**
 * @swagger
 * /api/leaderboard:
 *   get:
 *     summary: Ambil ranking user berdasarkan poin
 *     tags: [Leaderboard]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema: { type: string, enum: [national, city], default: national }
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *         description: Wajib diisi kalau type=city
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: List ranking berhasil diambil
 */
router.get("/", async (req, res) => {
  try {
    const { type = "national", city, limit = 10 } = req.query;

    const filter = {
      is_active: true,
      is_profile_complete: true,
      total_points: { $gt: 0 },
    };

    if (type === "city" && city) {
      filter.city = city;
    }

    const users = await User.find(filter)
      .select(
        "first_name last_name username avatar_url total_points role city trust_score",
      )
      .sort({ total_points: -1 })
      .limit(parseInt(limit));

    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/leaderboard/me:
 *   get:
 *     summary: Ambil posisi ranking user login (nasional & kota)
 *     tags: [Leaderboard]
 *     responses:
 *       200:
 *         description: Ranking user berhasil diambil
 *       404:
 *         description: User tidak ditemukan
 */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("total_points city");
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    // Ranking nasional
    const nationalRank =
      (await User.countDocuments({
        total_points: { $gt: user.total_points },
        is_active: true,
        is_profile_complete: true,
      })) + 1;

    // Ranking kota
    const cityRank = user.city
      ? (await User.countDocuments({
          total_points: { $gt: user.total_points },
          city: user.city,
          is_active: true,
          is_profile_complete: true,
        })) + 1
      : null;

    res.json({
      nationalRank,
      cityRank,
      total_points: user.total_points,
      city: user.city,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;