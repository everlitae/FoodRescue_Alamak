const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const Claim = require('../models/Claim');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// POST /api/ratings
router.post('/', auth, async (req, res) => {
  try {
    const { claim_id, score, review } = req.body;

    if (!score || score < 1 || score > 5) {
      return res.status(400).json({ msg: 'Score harus antara 1-5' });
    }

    const claim = await Claim.findById(claim_id).populate('donation_id');
    if (!claim) return res.status(404).json({ msg: 'Klaim tidak ditemukan' });
    if (claim.status !== 'completed') {
      return res.status(400).json({ msg: 'Klaim belum selesai' });
    }

    if (claim.seeker_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Hanya penerima donasi yang bisa memberi rating' });
    }

    const existing = await Rating.findOne({ claim_id });
    if (existing) return res.status(400).json({ msg: 'Kamu sudah memberi rating untuk klaim ini' });

    const ratee_id = claim.donation_id.provider_id;

    const rating = new Rating({
      claim_id,
      rater_id: req.user.id,
      ratee_id,
      score,
      review: review || '',
    });
    await rating.save();

    const allRatings = await Rating.find({ ratee_id });
    const avg = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length;
    await User.findByIdAndUpdate(ratee_id, {
      trust_score: Math.round(avg * 10) / 10,
    });

    await Notification.create({
      user_id: ratee_id,
      type: 'new_rating',
      title: 'Rating Baru!',
      body: `Kamu mendapat rating ${score}/5 untuk donasi "${claim.donation_id.title}"`,
      reference_type: 'donation',
      reference_id: claim.donation_id._id,
    });

    res.status(201).json({ msg: 'Rating berhasil dikirim!', rating });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// GET /api/ratings/check/:claimId
router.get('/check/:claimId', auth, async (req, res) => {
  try {
    const existing = await Rating.findOne({
      claim_id: req.params.claimId,
      rater_id: req.user.id,
    });
    res.json({ hasRated: !!existing, rating: existing });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/ratings/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const ratings = await Rating.find({ ratee_id: req.params.userId })
      .populate('rater_id', 'first_name last_name avatar_url')
      .populate({
        path: 'claim_id',
        populate: { path: 'donation_id', select: 'title' }
      })
      .sort({ created_at: -1 });

    const avg = ratings.length
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;

    res.json({ ratings, average: Math.round(avg * 10) / 10, total: ratings.length });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;