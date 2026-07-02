const express = require("express");
const router = express.Router();
const Rating = require("../models/rating");
const Claim = require("../models/claim");
const User = require("../models/user");
const Notification = require("../models/notification");
const { auth } = require("../middleware/auth");

/**
 * @swagger
 * /api/ratings:
 *   post:
 *     summary: Beri rating ke provider setelah klaim selesai
 *     tags: [Ratings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [claim_id, score]
 *             properties:
 *               claim_id: { type: string }
 *               score: { type: number, minimum: 1, maximum: 5 }
 *               review: { type: string }
 *     responses:
 *       201:
 *         description: Rating berhasil dikirim, +5 poin untuk rater
 *       400:
 *         description: Score invalid / klaim belum selesai / sudah pernah rating
 *       403:
 *         description: Hanya penerima donasi yang bisa memberi rating
 *       404:
 *         description: Klaim tidak ditemukan
 */
router.post("/", auth, async (req, res) => {
  try {
    const { claim_id, score, review } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ msg: "Score harus antara 1-5" });
    }

    const claim = await Claim.findById(claim_id).populate("donation_id");
    if (!claim) return res.status(404).json({ msg: "Klaim tidak ditemukan" });
    if (claim.status !== "completed") {
      return res.status(400).json({ msg: "Klaim belum selesai" });
    }

    if (claim.seeker_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ msg: "Hanya penerima donasi yang bisa memberi rating" });
    }

    const existing = await Rating.findOne({ claim_id });
    if (existing)
      return res
        .status(400)
        .json({ msg: "Kamu sudah memberi rating untuk klaim ini" });

    const ratee_id = claim.donation_id.provider_id;

    const rating = new Rating({
      claim_id,
      rater_id: req.user.id,
      ratee_id,
      score,
      review: review || "",
    });
    await rating.save();

    // Update trust score provider
    const allRatings = await Rating.find({ ratee_id });
    const avg =
      allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
    await User.findByIdAndUpdate(ratee_id, {
      trust_score: Math.round(avg * 10) / 10,
    });

    // Notif ke provider
    await Notification.create({
      user_id: ratee_id,
      type: "new_rating",
      title: "Rating Baru!",
      body: `Kamu mendapat rating ${score}/5 untuk donasi "${claim.donation_id.title}"`,
      reference_type: "donation",
      reference_id: claim.donation_id._id,
    });

    // +5 poin untuk rater
    await User.findByIdAndUpdate(req.user.id, { $inc: { total_points: 5 } });

    // Notif +5 poin ke rater
    await Notification.create({
      user_id: req.user.id,
      type: "new_rating",
      title: "⚡ +5 Poin!",
      body: "Terima kasih sudah memberi rating! Kamu mendapat 5 poin.",
      reference_type: "donation",
      reference_id: claim.donation_id._id,
    });

    const io = req.app.get("io");
    io.emit("push_notification", {
      title: "⚡ +5 Poin!",
      body: "Terima kasih sudah memberi rating! Kamu mendapat 5 poin.",
      type: "new_rating",
      for_user: req.user.id,
    });

    res.status(201).json({ msg: "Rating berhasil dikirim!", rating });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/ratings/check/{claimId}:
 *   get:
 *     summary: Cek apakah user login sudah memberi rating untuk sebuah klaim
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: claimId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status rating berhasil diambil
 */
router.get("/check/:claimId", auth, async (req, res) => {
  try {
    const existing = await Rating.findOne({
      claim_id: req.params.claimId,
      rater_id: req.user.id,
    });
    res.json({ hasRated: !!existing, rating: existing });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/ratings/user/{userId}:
 *   get:
 *     summary: Ambil semua rating yang diterima seorang user + rata-ratanya
 *     tags: [Ratings]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List rating & rata-rata berhasil diambil
 */
router.get("/user/:userId", async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee_id: req.params.userId })
      .populate("rater_id", "first_name last_name avatar_url")
      .populate({
        path: "claim_id",
        populate: { path: "donation_id", select: "title" },
      })
      .sort({ created_at: -1 });

    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;

    res.json({
      ratings,
      average: Math.round(avg * 10) / 10,
      total: ratings.length,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;