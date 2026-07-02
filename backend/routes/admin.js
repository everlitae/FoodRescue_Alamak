const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Donation = require("../models/donation");
const Claim = require("../models/claim");
const Report = require("../models/report");
const Notification = require("../models/notification");
const CommunityPost = require("../models/communitypost");
const FoodCategory = require("../models/foodcategory");
const { adminAuth } = require("../middleware/auth");

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Ambil statistik ringkasan platform (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Statistik berhasil diambil
 */
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({
      role: { $ne: "admin" },
      deleted_at: null,
    });
    const totalProviders = await User.countDocuments({ role: "food_provider" });
    const totalSeekers = await User.countDocuments({ role: "food_seeker" });
    const totalDonations = await Donation.countDocuments({ deleted_at: null });
    const availableDonations = await Donation.countDocuments({
      status: { $in: ["available", "partially_claimed"] },
    });
    const completedDonations = await Donation.countDocuments({
      status: "completed",
    });
    const totalClaims = await Claim.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "pending" });
    const totalPosts = await CommunityPost.countDocuments({ deleted_at: null });

    res.json({
      totalUsers,
      totalProviders,
      totalSeekers,
      totalDonations,
      availableDonations,
      completedDonations,
      totalClaims,
      pendingReports,
      totalPosts,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Ambil semua user non-admin (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List user berhasil diambil
 */
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password_hash")
      .sort({ created_at: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/toggle:
 *   put:
 *     summary: Aktifkan/nonaktifkan akun user (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status akun berhasil diubah
 *       404:
 *         description: User tidak ditemukan
 */
router.put("/users/:id/toggle", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    user.is_active = !user.is_active;
    await user.save();
    res.json({
      msg: `User ${user.is_active ? "diaktifkan" : "dinonaktifkan"}`,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   delete:
 *     summary: Hapus (soft-delete) akun user (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: User dihapus
 *       404:
 *         description: User tidak ditemukan
 */
router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    user.deleted_at = new Date();
    user.is_active = false;
    await user.save();
    res.json({ msg: "User dihapus" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/donations:
 *   get:
 *     summary: Ambil semua donasi termasuk yang sudah dihapus (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List donasi berhasil diambil
 */
router.get("/donations", adminAuth, async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate("provider_id", "first_name last_name email")
      .populate("category_id", "name icon_emoji")
      .sort({ created_at: -1 });
    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/donations/{id}:
 *   delete:
 *     summary: Hapus donasi manapun secara paksa (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Donasi dihapus oleh admin
 */
router.delete("/donations/:id", adminAuth, async (req, res) => {
  try {
    await Donation.findByIdAndUpdate(req.params.id, {
      deleted_at: new Date(),
      status: "cancelled",
    });
    res.json({ msg: "Donasi dihapus oleh admin" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Ambil semua laporan (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List laporan berhasil diambil
 */
router.get("/reports", adminAuth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("reporter_id", "first_name last_name email")
      .populate("resolved_by", "first_name last_name")
      .sort({ created_at: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/reports/{id}/resolve:
 *   put:
 *     summary: Tandai laporan sebagai selesai ditangani (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Laporan diselesaikan
 *       404:
 *         description: Laporan tidak ditemukan
 */
router.put("/reports/:id/resolve", adminAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ msg: "Laporan tidak ditemukan" });

    report.status = "resolved";
    report.resolved_by = req.user.id;
    report.resolved_at = new Date();
    await report.save();

    res.json({ msg: "Laporan diselesaikan" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/reports/{id}/dismiss:
 *   put:
 *     summary: Abaikan (dismiss) laporan (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Laporan di-dismiss
 *       404:
 *         description: Laporan tidak ditemukan
 */
router.put("/reports/:id/dismiss", adminAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report)
      return res.status(404).json({ msg: "Laporan tidak ditemukan" });

    report.status = "dismissed";
    report.resolved_by = req.user.id;
    report.resolved_at = new Date();
    await report.save();

    res.json({ msg: "Laporan di-dismiss" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/conversations:
 *   get:
 *     summary: Ambil semua percakapan di platform (admin only, buat moderasi)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List percakapan berhasil diambil
 */
router.get("/conversations", adminAuth, async (req, res) => {
  try {
    const Conversation = require("../models/conversation");
    const conversations = await Conversation.find()
      .populate("provider_id", "first_name last_name email")
      .populate("seeker_id", "first_name last_name email")
      .populate("donation_id", "title")
      .sort({ last_message_at: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/community:
 *   get:
 *     summary: Ambil semua post komunitas (admin only, buat moderasi)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List post berhasil diambil
 */
router.get("/community", adminAuth, async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("author_id", "first_name last_name email")
      .sort({ created_at: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/community/{id}/pin:
 *   put:
 *     summary: Pin/unpin post komunitas (admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status pin berhasil diubah
 *       404:
 *         description: Post tidak ditemukan
 */
router.put("/community/:id/pin", adminAuth, async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post tidak ditemukan" });
    post.is_pinned = !post.is_pinned;
    await post.save();
    res.json({ msg: `Post ${post.is_pinned ? "di-pin" : "di-unpin"}` });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/admin/categories:
 *   get:
 *     summary: Ambil semua kategori termasuk yang non-aktif (admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: List kategori berhasil diambil
 */
router.get("/categories", adminAuth, async (req, res) => {
  try {
    const categories = await FoodCategory.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;