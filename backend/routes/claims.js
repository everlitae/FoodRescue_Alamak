const express = require("express");
const router = express.Router();
const Claim = require("../models/claim");
const Donation = require("../models/donation");
const User = require("../models/user");
const Notification = require("../models/notification");
const { auth } = require("../middleware/auth");

/**
 * @swagger
 * /api/claims:
 *   post:
 *     summary: Klaim sebuah donasi (max 1 unit per orang)
 *     tags: [Claims]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [donation_id, quantity_claimed]
 *             properties:
 *               donation_id: { type: string }
 *               quantity_claimed: { type: number, example: 1 }
 *               pickup_scheduled_at: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Klaim berhasil dibuat, +10 poin untuk seeker
 *       400:
 *         description: Donasi tidak tersedia / stok kurang / sudah pernah klaim
 *       404:
 *         description: Donasi tidak ditemukan
 */
router.post("/", auth, async (req, res) => {
  try {
    const { donation_id, quantity_claimed, pickup_scheduled_at, notes } =
      req.body;

    const donation = await Donation.findById(donation_id);
    if (!donation)
      return res.status(404).json({ msg: "Donasi tidak ditemukan" });
    if (!["available", "partially_claimed"].includes(donation.status)) {
      return res.status(400).json({ msg: "Donasi sudah tidak tersedia" });
    }
    if (donation.provider_id.toString() === req.user.id) {
      return res.status(400).json({ msg: "Tidak bisa klaim donasi sendiri" });
    }
    if (quantity_claimed > donation.quantity_remaining) {
      return res.status(400).json({
        msg: `Stok tersisa hanya ${donation.quantity_remaining} ${donation.quantity_unit}`,
      });
    }

    const MAX_CLAIM = 1;
    if (quantity_claimed > MAX_CLAIM) {
      return res.status(400).json({
        msg: `Maksimal klaim ${MAX_CLAIM} ${donation.quantity_unit} per orang`,
      });
    }

    const existing = await Claim.findOne({
      donation_id,
      seeker_id: req.user.id,
      status: { $in: ["pending", "confirmed", "picked_up"] },
    });
    if (existing)
      return res.status(400).json({ msg: "Kamu sudah mengklaim donasi ini" });

    const claim = new Claim({
      donation_id,
      seeker_id: req.user.id,
      quantity_claimed,
      pickup_scheduled_at,
      notes,
      tracking_log: [
        {
          new_status: "pending",
          changed_by: req.user.id,
          note: "Klaim dibuat",
        },
      ],
    });
    await claim.save();

    donation.quantity_remaining -= quantity_claimed;
    donation.status =
      donation.quantity_remaining <= 0 ? "fully_claimed" : "partially_claimed";
    await donation.save();

    const io = req.app.get("io");

    // Notif ke provider
    await Notification.create({
      user_id: donation.provider_id,
      type: "donation_claimed",
      title: "Donasi Diklaim!",
      body: `Donasi "${donation.title}" diklaim sebanyak ${quantity_claimed} ${donation.quantity_unit}`,
      reference_type: "claim",
      reference_id: claim._id,
    });
    io.emit("push_notification", {
      title: "Donasi Diklaim! 🎉",
      body: `Donasi "${donation.title}" diklaim sebanyak ${quantity_claimed} ${donation.quantity_unit}`,
      type: "donation_claimed",
      for_user: donation.provider_id.toString(),
    });

    // Notif klaim berhasil ke seeker
    await Notification.create({
      user_id: req.user.id,
      type: "claim_confirmed",
      title: "Klaim Berhasil!",
      body: `Kamu berhasil mengklaim "${donation.title}" sebanyak ${quantity_claimed} ${donation.quantity_unit}. Tunggu konfirmasi dari provider.`,
      reference_type: "claim",
      reference_id: claim._id,
    });
    io.emit("push_notification", {
      title: "Klaim Berhasil! ✅",
      body: `Kamu berhasil mengklaim "${donation.title}"`,
      type: "claim_confirmed",
      for_user: req.user.id,
    });

    // +10 poin untuk seeker
    await User.findByIdAndUpdate(req.user.id, { $inc: { total_points: 10 } });

    // Notif +10 poin
    await Notification.create({
      user_id: req.user.id,
      type: "claim_confirmed",
      title: "⚡ +10 Poin!",
      body: `Kamu mendapat 10 poin dari klaim donasi "${donation.title}"!`,
      reference_type: "claim",
      reference_id: claim._id,
    });
    io.emit("push_notification", {
      title: "⚡ +10 Poin!",
      body: `Kamu mendapat 10 poin dari klaim donasi "${donation.title}"!`,
      type: "claim_confirmed",
      for_user: req.user.id,
    });

    res.status(201).json({ msg: "Klaim berhasil!", claim });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

/**
 * @swagger
 * /api/claims/my:
 *   get:
 *     summary: Ambil semua klaim milik user login (sebagai seeker)
 *     tags: [Claims]
 *     responses:
 *       200:
 *         description: List klaim berhasil diambil
 */
router.get("/my", auth, async (req, res) => {
  try {
    const claims = await Claim.find({ seeker_id: req.user.id })
      .populate({
        path: "donation_id",
        populate: { path: "category_id", select: "name icon_emoji" },
      })
      .sort({ created_at: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/claims/donation/{donationId}:
 *   get:
 *     summary: Ambil semua klaim untuk 1 donasi (khusus provider donasi tsb)
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: donationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List klaim berhasil diambil
 *       403:
 *         description: Akses ditolak (bukan provider donasi ini)
 *       404:
 *         description: Donasi tidak ditemukan
 */
router.get("/donation/:donationId", auth, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);
    if (!donation)
      return res.status(404).json({ msg: "Donasi tidak ditemukan" });
    if (donation.provider_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }
    const claims = await Claim.find({ donation_id: req.params.donationId })
      .populate(
        "seeker_id",
        "first_name last_name username trust_score avatar_url",
      )
      .sort({ created_at: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/claims/{id}/confirm:
 *   put:
 *     summary: Provider konfirmasi klaim (pending → confirmed)
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Klaim dikonfirmasi
 *       400:
 *         description: Klaim sudah diproses sebelumnya
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Klaim tidak ditemukan
 */
router.put("/:id/confirm", auth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate("donation_id");
    if (!claim) return res.status(404).json({ msg: "Klaim tidak ditemukan" });
    if (claim.donation_id.provider_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }
    if (claim.status !== "pending") {
      return res.status(400).json({ msg: "Klaim sudah diproses" });
    }

    claim.status = "confirmed";
    claim.tracking_log.push({
      previous_status: "pending",
      new_status: "confirmed",
      changed_by: req.user.id,
    });
    await claim.save();

    const io = req.app.get("io");
    await Notification.create({
      user_id: claim.seeker_id,
      type: "claim_confirmed",
      title: "Klaim Dikonfirmasi!",
      body: `Klaim kamu untuk "${claim.donation_id.title}" telah dikonfirmasi`,
      reference_type: "claim",
      reference_id: claim._id,
    });
    io.emit("push_notification", {
      title: "Klaim Dikonfirmasi! ✅",
      body: `Klaim kamu untuk "${claim.donation_id.title}" telah dikonfirmasi`,
      type: "claim_confirmed",
      for_user: claim.seeker_id.toString(),
    });

    res.json({ msg: "Klaim dikonfirmasi!", claim });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/claims/{id}/pickup:
 *   put:
 *     summary: Tandai makanan sudah diambil (confirmed → picked_up)
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Ditandai sudah diambil
 *       400:
 *         description: Klaim belum dikonfirmasi
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Klaim tidak ditemukan
 */
router.put("/:id/pickup", auth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate("donation_id");
    if (!claim) return res.status(404).json({ msg: "Klaim tidak ditemukan" });
    if (claim.donation_id.provider_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }
    if (claim.status !== "confirmed") {
      return res.status(400).json({ msg: "Klaim belum dikonfirmasi" });
    }

    claim.status = "picked_up";
    claim.picked_up_at = new Date();
    claim.tracking_log.push({
      previous_status: "confirmed",
      new_status: "picked_up",
      changed_by: req.user.id,
    });
    await claim.save();

    const io = req.app.get("io");
    io.emit("push_notification", {
      title: "Makanan Sudah Diambil! 📦",
      body: `Makanan dari donasi "${claim.donation_id.title}" sudah diambil`,
      type: "claim_confirmed",
      for_user: claim.seeker_id.toString(),
    });

    res.json({ msg: "Ditandai sudah diambil!", claim });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/claims/{id}/complete:
 *   put:
 *     summary: Selesaikan klaim (picked_up → completed)
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Klaim selesai
 *       400:
 *         description: Makanan belum diambil
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Klaim tidak ditemukan
 */
router.put("/:id/complete", auth, async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate("donation_id");
    if (!claim) return res.status(404).json({ msg: "Klaim tidak ditemukan" });
    if (claim.donation_id.provider_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Akses ditolak" });
    }
    if (claim.status !== "picked_up") {
      return res.status(400).json({ msg: "Makanan belum diambil" });
    }

    claim.status = "completed";
    claim.completed_at = new Date();
    claim.tracking_log.push({
      previous_status: "picked_up",
      new_status: "completed",
      changed_by: req.user.id,
    });
    await claim.save();

    await User.findByIdAndUpdate(req.user.id, {
      $inc: { "profile.total_donations": 1 },
    });
    await User.findByIdAndUpdate(claim.seeker_id, {
      $inc: { "profile.total_claims": 1 },
    });

    const activeClaims = await Claim.countDocuments({
      donation_id: claim.donation_id._id,
      status: { $in: ["pending", "confirmed", "picked_up"] },
    });
    if (activeClaims === 0) {
      await Donation.findByIdAndUpdate(claim.donation_id._id, {
        status: "completed",
      });
    }

    const io = req.app.get("io");
    await Notification.create({
      user_id: claim.seeker_id,
      type: "donation_completed",
      title: "Donasi Selesai!",
      body: `Donasi "${claim.donation_id.title}" telah selesai. Jangan lupa beri rating!`,
      reference_type: "claim",
      reference_id: claim._id,
    });
    io.emit("push_notification", {
      title: "Donasi Selesai! 🎉",
      body: `Donasi "${claim.donation_id.title}" telah selesai. Jangan lupa beri rating!`,
      type: "donation_completed",
      for_user: claim.seeker_id.toString(),
    });

    res.json({ msg: "Klaim selesai!", claim });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/claims/{id}/cancel:
 *   put:
 *     summary: Batalkan klaim (bisa oleh seeker atau provider)
 *     tags: [Claims]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cancellation_reason: { type: string }
 *     responses:
 *       200:
 *         description: Klaim dibatalkan
 *       400:
 *         description: Klaim tidak bisa dibatalkan (status tidak sesuai)
 *       403:
 *         description: Akses ditolak
 *       404:
 *         description: Klaim tidak ditemukan
 */
router.put("/:id/cancel", auth, async (req, res) => {
  try {
    const { cancellation_reason } = req.body;
    const claim = await Claim.findById(req.params.id).populate("donation_id");
    if (!claim) return res.status(404).json({ msg: "Klaim tidak ditemukan" });

    const isSeeker = claim.seeker_id.toString() === req.user.id;
    const isProvider = claim.donation_id.provider_id.toString() === req.user.id;
    if (!isSeeker && !isProvider)
      return res.status(403).json({ msg: "Akses ditolak" });
    if (!["pending", "confirmed"].includes(claim.status)) {
      return res.status(400).json({ msg: "Klaim tidak bisa dibatalkan" });
    }

    const prevStatus = claim.status;
    claim.status = "cancelled";
    claim.cancellation_reason = cancellation_reason;
    claim.tracking_log.push({
      previous_status: prevStatus,
      new_status: "cancelled",
      changed_by: req.user.id,
    });
    await claim.save();

    const donation = await Donation.findById(claim.donation_id._id);
    donation.quantity_remaining += claim.quantity_claimed;
    if (donation.quantity_remaining > 0 && donation.status !== "available") {
      donation.status =
        donation.quantity_remaining >= donation.quantity
          ? "available"
          : "partially_claimed";
    }
    await donation.save();

    const notifUserId = isSeeker
      ? claim.donation_id.provider_id
      : claim.seeker_id;
    const io = req.app.get("io");
    await Notification.create({
      user_id: notifUserId,
      type: "claim_cancelled",
      title: "Klaim Dibatalkan",
      body: `Klaim untuk "${claim.donation_id.title}" dibatalkan`,
      reference_type: "claim",
      reference_id: claim._id,
    });
    io.emit("push_notification", {
      title: "Klaim Dibatalkan ❌",
      body: `Klaim untuk "${claim.donation_id.title}" dibatalkan`,
      type: "claim_cancelled",
      for_user: notifUserId.toString(),
    });

    res.json({ msg: "Klaim dibatalkan", claim });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;