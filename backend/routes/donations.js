const express = require("express");
const router = express.Router();
const multer = require("multer");
const Donation = require("../models/donation");
const FoodCategory = require("../models/foodcategory");
const User = require("../models/user");
const Notification = require("../models/notification");
const { auth, requireRole } = require("../middleware/auth");

const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "foodrescue/donations",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1000, quality: "auto" }],
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * @swagger
 * /api/donations:
 *   get:
 *     summary: Ambil daftar donasi (dengan filter)
 *     tags: [Donations]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: ID kategori
 *       - in: query
 *         name: city
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Cari berdasarkan judul
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [available, partially_claimed, claimed, completed, cancelled] }
 *       - in: query
 *         name: halal
 *         schema: { type: string, enum: ["true", "false"] }
 *     responses:
 *       200:
 *         description: List donasi berhasil diambil
 */
router.get("/", async (req, res) => {
  try {
    const { category, city, search, status, halal } = req.query;
    let filter = { deleted_at: null };

    if (status) filter.status = status;
    else filter.status = { $in: ["available", "partially_claimed"] };

    if (category) filter.category_id = category;
    if (city) filter.pickup_city = new RegExp(city, "i");
    if (search) filter.title = new RegExp(search, "i");
    if (halal === "true") filter.is_halal = true;
    else if (halal === "false") filter.is_halal = false;

    const donations = await Donation.find(filter)
      .populate("provider_id", "first_name last_name trust_score avatar_url")
      .populate("category_id", "name icon_emoji color_hex")
      .sort({ created_at: -1 });

    res.json(donations);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/donations/user/history:
 *   get:
 *     summary: Ambil riwayat donasi yang dibuat user login
 *     tags: [Donations]
 *     responses:
 *       200:
 *         description: Riwayat donasi berhasil diambil
 */
router.get("/user/history", auth, async (req, res) => {
  try {
    const provided = await Donation.find({
      provider_id: req.user.id,
      deleted_at: null,
    })
      .populate("category_id", "name icon_emoji")
      .sort({ created_at: -1 });
    res.json({ provided });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/donations/{id}:
 *   get:
 *     summary: Ambil detail 1 donasi
 *     tags: [Donations]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detail donasi berhasil diambil
 *       404:
 *         description: Donasi tidak ditemukan
 */
router.get("/:id", async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate(
        "provider_id",
        "first_name last_name trust_score avatar_url city phone",
      )
      .populate("category_id", "name icon_emoji color_hex");
    if (!donation)
      return res.status(404).json({ msg: "Donasi tidak ditemukan" });

    donation.view_count += 1;
    await donation.save();

    res.json(donation);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * @swagger
 * /api/donations:
 *   post:
 *     summary: Buat donasi baru (khusus role food_provider/admin, upload max 5 foto)
 *     tags: [Donations]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, category_id, quantity, quantity_unit, pickup_address, pickup_city, expired_at]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               category_id: { type: string }
 *               quantity: { type: number }
 *               quantity_unit: { type: string, example: "porsi" }
 *               pickup_address: { type: string }
 *               pickup_city: { type: string }
 *               pickup_notes: { type: string }
 *               pickup_start_time: { type: string }
 *               pickup_end_time: { type: string }
 *               longitude: { type: number }
 *               latitude: { type: number }
 *               expired_at: { type: string, format: date-time }
 *               is_halal: { type: string, enum: ["true", "false"] }
 *               allergen_notes: { type: string }
 *               photos:
 *                 type: array
 *                 items: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Donasi berhasil dibuat, +50 poin untuk provider
 *       400:
 *         description: Kategori tidak valid / upload error
 */
router.post(
  "/",
  auth,
  requireRole("food_provider", "admin"),
  (req, res, next) => {
    upload.array("photos", 5)(req, res, (err) => {
      if (err)
        return res.status(400).json({ msg: err.message, field: err.field });
      next();
    });
  },
  async (req, res) => {
    try {
      const {
        title,
        description,
        category_id,
        quantity,
        quantity_unit,
        pickup_address,
        pickup_city,
        pickup_notes,
        pickup_start_time,
        pickup_end_time,
        longitude,
        latitude,
        expired_at,
        is_halal,
        allergen_notes,
      } = req.body;

      const category = await FoodCategory.findById(category_id);
      if (!category)
        return res.status(400).json({ msg: "Kategori tidak valid" });

      const photos = req.files
        ? req.files.map((f, i) => ({ photo_url: f.path, sort_order: i }))
        : [];

      const donation = new Donation({
        provider_id: req.user.id,
        category_id,
        category_snapshot: {
          name: category.name,
          icon_emoji: category.icon_emoji,
          color_hex: category.color_hex,
        },
        title,
        description,
        quantity: Number(quantity),
        quantity_unit,
        pickup_address,
        pickup_city,
        pickup_notes,
        pickup_start_time,
        pickup_end_time,
        pickup_location: {
          type: "Point",
          coordinates: [parseFloat(longitude) || 0, parseFloat(latitude) || 0],
        },
        expired_at,
        is_halal:
          is_halal === "true" ? true : is_halal === "false" ? false : null,
        allergen_notes,
        photos,
      });

      await donation.save();

      // +50 poin untuk provider
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { total_points: 50, "profile.total_donations": 1 },
      });

      // Simpan notifikasi ke DB
      await Notification.create({
        user_id: req.user.id,
        type: "donation_completed",
        title: "🎉 +50 Poin!",
        body: `Terima kasih telah mendonasikan "${title}". Kamu mendapat 50 poin!`,
        reference_type: "donation",
        reference_id: donation._id,
      });

      // Emit socket ke user
      const io = req.app.get("io");
      io.emit("push_notification", {
        title: "🎉 +50 Poin!",
        body: `Terima kasih telah mendonasikan "${title}". Kamu mendapat 50 poin!`,
        type: "donation_completed",
        for_user: req.user.id,
      });

      res.status(201).json({ msg: "Donasi berhasil dibuat!", donation });
    } catch (err) {
      res.status(500).json({ msg: "Server error", error: err.message });
    }
  },
);

/**
 * @swagger
 * /api/donations/{id}:
 *   put:
 *     summary: Update donasi milik sendiri
 *     tags: [Donations]
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
 *               title: { type: string }
 *               description: { type: string }
 *               quantity_unit: { type: string }
 *               pickup_address: { type: string }
 *               pickup_city: { type: string }
 *               pickup_notes: { type: string }
 *               pickup_start_time: { type: string }
 *               pickup_end_time: { type: string }
 *               expired_at: { type: string }
 *               allergen_notes: { type: string }
 *     responses:
 *       200:
 *         description: Donasi berhasil diperbarui
 *       403:
 *         description: Bukan donasi milik user ini
 *       404:
 *         description: Donasi tidak ditemukan
 */
router.put(
  "/:id",
  auth,
  requireRole("food_provider", "admin"),
  async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.id);
      if (!donation)
        return res.status(404).json({ msg: "Donasi tidak ditemukan" });
      if (donation.provider_id.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Bukan donasi kamu" });
      }

      const fields = [
        "title",
        "description",
        "quantity_unit",
        "pickup_address",
        "pickup_city",
        "pickup_notes",
        "pickup_start_time",
        "pickup_end_time",
        "expired_at",
        "allergen_notes",
      ];
      fields.forEach((f) => {
        if (req.body[f] !== undefined) donation[f] = req.body[f];
      });

      await donation.save();
      res.json({ msg: "Donasi diperbarui", donation });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  },
);

/**
 * @swagger
 * /api/donations/{id}:
 *   delete:
 *     summary: Hapus (soft-delete) donasi milik sendiri
 *     tags: [Donations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Donasi dihapus
 *       403:
 *         description: Bukan donasi milik user ini
 *       404:
 *         description: Donasi tidak ditemukan
 */
router.delete(
  "/:id",
  auth,
  requireRole("food_provider", "admin"),
  async (req, res) => {
    try {
      const donation = await Donation.findById(req.params.id);
      if (!donation)
        return res.status(404).json({ msg: "Donasi tidak ditemukan" });
      if (donation.provider_id.toString() !== req.user.id) {
        return res.status(403).json({ msg: "Bukan donasi kamu" });
      }

      donation.deleted_at = new Date();
      donation.status = "cancelled";
      await donation.save();

      res.json({ msg: "Donasi dihapus" });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  },
);

module.exports = router;