const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      username,
      phone,
      password,
      role,
      city,
    } = req.body;

    // Validasi role
    if (!["food_provider", "food_seeker"].includes(role)) {
      return res.status(400).json({ msg: "Role tidak valid" });
    }

    // Validasi field
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ msg: "Field wajib belum lengkap" });
    }

    // Validasi password
    if (password.length < 8) {
      return res.status(400).json({ msg: "Password minimal 8 karakter" });
    }

    // Cek email duplikat
    const emailLower = email.trim().toLowerCase();
    const existingEmail = await User.findOne({ email: emailLower });
    if (existingEmail)
      return res.status(400).json({ msg: "Email sudah terdaftar" });

    // Cek username duplikat
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername)
        return res.status(400).json({ msg: "Username sudah dipakai" });
    }

    // Cek phone duplikat
    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone)
        return res.status(400).json({ msg: "Nomor HP sudah terdaftar" });
    }

    // Buat user baru — password_hash akan di-hash otomatis lewat pre-save hook
    const user = new User({
      first_name,
      last_name,
      email: emailLower,
      username,
      phone,
      password_hash: password,
      role,
      city,
      profile: {},
    });

    await user.save();

    // Buat token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "rahasia123",
      { expiresIn: "7d" },
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar_url: user.avatar_url,
        trust_score: user.trust_score,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "Email dan password wajib diisi" });
    }

    // Cari user + include password_hash (select: false by default)
    const emailLower = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLower }).select(
      "+password_hash",
    );
    if (!user) {
      return res.status(400).json({ msg: "Email atau Password salah" });
    }

    if (!user.is_active)
      return res.status(400).json({ msg: "Akun dinonaktifkan" });

    // Cek password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Email atau Password salah" });
    }

    // Update last_login_at
    user.last_login_at = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "rahasia123",
      { expiresIn: "7d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        role: user.role,
        avatar_url: user.avatar_url,
        trust_score: user.trust_score,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /api/auth/me
router.get("/me", require("../middleware/auth").auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
    res.json({
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      username: user.username,
      role: user.role,
      avatar_url: user.avatar_url,
      trust_score: user.trust_score,
      total_points: user.total_points,
      profile: user.profile,
      city: user.city,
      phone: user.phone,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
