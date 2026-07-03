const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Otp = require("../models/otp");
const passport = require("../config/passport");
const { auth } = require("../middleware/auth");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
});

async function sendVerifyOtp(email, otp) {
  await transporter.sendMail({
    from: `"FoodRescue Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verifikasi Email FoodRescue",
    html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap" rel="stylesheet" />
</head>
<body style="margin:0;padding:0;background-color:#f5faf2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5faf2;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background:#fff;border-radius:20px;box-shadow:0 8px 48px rgba(60,100,40,.26);overflow:hidden;">
        <tr><td style="background:linear-gradient(155deg,#2e5220 0%,#5f8b4c 50%,#b8694a 100%);padding:36px 30px 30px;text-align:center;">
          <span style="font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#ffffff;">FoodRescue</span>
        </td></tr>
        <tr><td style="padding:32px 30px 24px;">
          <p style="margin:0 0 26px 0;font-size:14px;color:#6b8c5a;line-height:1.8;">Gunakan kode OTP berikut untuk verifikasi email kamu.</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
            <tr><td style="background:linear-gradient(160deg,#eef7e6 0%,#d4efbf 100%);border:2px solid #a8d48a;border-radius:16px;padding:24px 20px;text-align:center;">
              <p style="margin:0 0 12px 0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6b8c5a;">Kode Verifikasi</p>
              <div style="font-size:46px;font-weight:900;letter-spacing:16px;text-indent:16px;color:#5f8b4c;font-family:'Courier New',monospace;margin-bottom:16px;">${otp}</div>
              <span style="display:inline-block;background:#eef7e6;border:1px solid #6b8c5a;border-radius:999px;padding:5px 14px;font-size:11px;font-weight:700;color:#6b8c5a;">⏱ Berlaku <strong>5 menit</strong></span>
            </td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff3d9;border:1px solid #ffddab;border-radius:12px;">
            <tr><td style="padding:14px 16px;"><p style="margin:0;font-size:12px;color:#945034;">⚠️ <strong>Jangan bagikan kode ini</strong> ke siapa pun.</p></td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#edf5e6;padding:18px 30px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9ab88a;">© 2026 FoodRescue • All rights reserved</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}

// ── POST /api/auth/register ──────────────────────────────────────────
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrasi akun baru (email & password)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Registrasi berhasil, OTP dikirim ke email
 *       400:
 *         description: Email sudah terdaftar / input tidak valid
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Email dan password wajib diisi" });
    if (password.length < 8)
      return res.status(400).json({ msg: "Password minimal 8 karakter" });

    const emailLower = email.trim().toLowerCase();
    const existingVerified = await User.findOne({
      email: emailLower,
      is_verified: true,
    });
    if (existingVerified)
      return res.status(400).json({ msg: "Email sudah terdaftar" });

    await User.deleteOne({ email: emailLower, is_verified: false });

    const user = new User({
      first_name: "User",
      email: emailLower,
      password_hash: password,
      role: "food_seeker",
      is_verified: false,
      is_profile_complete: false,
      profile: {},
    });
    await user.save();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    await Otp.deleteMany({ email: emailLower });
    await Otp.create({
      email: emailLower,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    await sendVerifyOtp(emailLower, otp);

    res.status(201).json({
      msg: "Registrasi berhasil. Cek email kamu.",
      email: emailLower,
      requireVerification: true,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── POST /api/auth/verify-email ──────────────────────────────────────
/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verifikasi email dengan kode OTP setelah register
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, otp]
 *             properties:
 *               email: { type: string }
 *               otp: { type: string, example: "123456" }
 *     responses:
 *       200:
 *         description: Email terverifikasi, mengembalikan JWT token
 *       400:
 *         description: OTP salah/kadaluarsa/terlalu banyak percobaan
 */
router.post("/verify-email", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ msg: "Email dan OTP wajib diisi" });

    const emailLower = email.trim().toLowerCase();
    const otpRecord = await Otp.findOne({ email: emailLower });
    if (!otpRecord)
      return res
        .status(400)
        .json({ msg: "OTP tidak ditemukan atau sudah kadaluarsa" });
    if (new Date() > otpRecord.expiresAt) {
      await Otp.deleteOne({ email: emailLower });
      return res
        .status(400)
        .json({ msg: "OTP sudah kadaluarsa. Daftar ulang." });
    }
    if (otpRecord.attempts >= otpRecord.maxAttempts)
      return res
        .status(400)
        .json({ msg: "Terlalu banyak percobaan. Daftar ulang." });

    const isMatch = await bcrypt.compare(otp.toString(), otpRecord.otp);
    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({
        msg: `OTP salah. Sisa percobaan: ${otpRecord.maxAttempts - otpRecord.attempts}`,
      });
    }

    const user = await User.findOne({ email: emailLower, is_verified: false });
    if (!user)
      return res
        .status(400)
        .json({ msg: "User tidak ditemukan atau sudah diverifikasi" });

    user.is_verified = true;
    await user.save();
    await Otp.deleteOne({ email: emailLower });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "rahasia123",
      { expiresIn: "7d" },
    );

    res.json({
      msg: "Email berhasil diverifikasi!",
      token,
      needCompleteProfile: true,
      user: {
        id: user._id,
        first_name: user.first_name,
        email: user.email,
        role: user.role,
        is_profile_complete: user.is_profile_complete,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── POST /api/auth/resend-verify-otp ────────────────────────────────
/**
 * @swagger
 * /api/auth/resend-verify-otp:
 *   post:
 *     summary: Kirim ulang OTP verifikasi email (rate limit 1 menit)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200:
 *         description: OTP baru dikirim
 *       400:
 *         description: User tidak ditemukan / harus tunggu sebelum kirim ulang
 */
router.post("/resend-verify-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email wajib diisi" });

    const emailLower = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLower, is_verified: false });
    if (!user)
      return res
        .status(400)
        .json({ msg: "User tidak ditemukan atau sudah diverifikasi" });

    const existing = await Otp.findOne({ email: emailLower });
    if (existing) {
      const diff = (new Date() - existing.createdAt) / 1000;
      if (diff < 60)
        return res
          .status(400)
          .json({ msg: "Tunggu 1 menit sebelum kirim ulang OTP" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);
    await Otp.deleteMany({ email: emailLower });
    await Otp.create({
      email: emailLower,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    await sendVerifyOtp(emailLower, otp);

    res.json({ msg: "OTP baru sudah dikirim ke email kamu" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ── POST /api/auth/complete-profile ─────────────────────────────────
/**
 * @swagger
 * /api/auth/complete-profile:
 *   post:
 *     summary: Lengkapi profil setelah registrasi/login pertama kali
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role, first_name]
 *             properties:
 *               role: { type: string, enum: [food_provider, food_seeker] }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               username: { type: string }
 *               phone: { type: string }
 *               city: { type: string }
 *     responses:
 *       200:
 *         description: Profil berhasil dilengkapi
 *       400:
 *         description: Input tidak valid
 */
router.post("/complete-profile", auth, async (req, res) => {
  try {
    const { role, first_name, last_name, username, phone, city } = req.body;

    if (!role || !["food_provider", "food_seeker"].includes(role))
      return res.status(400).json({ msg: "Role tidak valid" });
    if (!first_name)
      return res.status(400).json({ msg: "Nama depan wajib diisi" });
    if (!username) return res.status(400).json({ msg: "Username wajib diisi" });
    if (!city) return res.status(400).json({ msg: "Kota wajib diisi" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    if (username !== user.username) {
      const existingUsername = await User.findOne({
        username: username.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existingUsername)
        return res.status(400).json({ msg: "Username sudah dipakai" });
    }

    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: user._id },
      });
      if (existingPhone)
        return res.status(400).json({ msg: "Nomor HP sudah terdaftar" });
    }

    // Jangan pernah nimpa role admin lewat form ini — admin cuma boleh
    // diubah manual/lewat proses terpisah, bukan dari form Complete Profile
    if (user.role !== "admin") {
      user.role = role;
    }
    user.first_name = first_name;
    user.last_name = last_name || "";
    user.username = username.toLowerCase();
    user.city = city;
    if (phone) user.phone = phone;
    const wasComplete = user.is_profile_complete;
    if (!wasComplete) {
      user.total_points = (user.total_points || 0) + 30;
    }
    user.is_profile_complete = true;
    await user.save();

    // Notif +30 poin complete profile (sekali)
    if (!wasComplete) {
      try {
        const Notification = require("../models/notification");
        await Notification.create({
          user_id: user._id,
          type: "donation_completed",
          title: "🎉 +30 Poin!",
          body: "Profil kamu sudah lengkap! Kamu mendapat 30 poin bonus.",
          reference_type: "user",
          reference_id: user._id,
        });
        const io = req.app.get("io");
        if (io) {
          io.emit("push_notification", {
            title: "🎉 +30 Poin!",
            body: "Profil kamu sudah lengkap! Kamu mendapat 30 poin bonus.",
            type: "donation_completed",
            for_user: user._id.toString(),
          });
        }
      } catch (e) {}
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "rahasia123",
      { expiresIn: "7d" },
    );

    res.json({
      msg: "Profil berhasil dilengkapi!",
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
        is_profile_complete: user.is_profile_complete,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login dengan email & password
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login berhasil, mengembalikan JWT token & data user
 *       400:
 *         description: Email/password salah
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ msg: "Email/Username dan password wajib diisi" });

    const identifier = email.trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password_hash");

    if (!user)
      return res
        .status(400)
        .json({ msg: "Email/Username atau Password salah" });
    if (!user.is_active)
      return res.status(400).json({ msg: "Akun dinonaktifkan" });
    if (!user.is_verified)
      return res.status(400).json({
        msg: "Email belum diverifikasi. Cek inbox kamu.",
        requireVerification: true,
        email: user.email,
      });
    if (!user.password_hash)
      return res.status(400).json({
        msg: "Akun ini menggunakan login Google. Silakan login dengan Google.",
      });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ msg: "Email atau Password salah" });

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
        is_profile_complete: user.is_profile_complete,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ── POST /api/auth/reset-password ───────────────────────────────────
/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password setelah OTP diverifikasi (via /api/otp/verify-otp)
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword, otpVerified]
 *             properties:
 *               email: { type: string }
 *               newPassword: { type: string, minLength: 8 }
 *               otpVerified: { type: boolean, description: "Harus true, didapat dari endpoint verify-otp" }
 *     responses:
 *       200:
 *         description: Password berhasil direset
 *       400:
 *         description: OTP belum diverifikasi / input tidak valid
 *       404:
 *         description: User tidak ditemukan
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword, otpVerified } = req.body;
    if (!otpVerified)
      return res.status(400).json({ msg: "OTP belum diverifikasi" });
    if (!email || !newPassword)
      return res.status(400).json({ msg: "Email dan password wajib diisi" });
    if (newPassword.length < 8)
      return res.status(400).json({ msg: "Password minimal 8 karakter" });

    const emailLower = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLower }).select(
      "+password_hash",
    );
    if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });

    user.password_hash = newPassword;
    await user.save();
    res.json({ msg: "Password berhasil direset" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ── GET /api/auth/me ─────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Ambil data user yang sedang login (berdasarkan JWT token)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Data user berhasil diambil
 *       401:
 *         description: Token tidak valid/tidak ada
 */
router.get("/me", auth, async (req, res) => {
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
      is_profile_complete: user.is_profile_complete,
      oauth_provider: user.oauth_provider,
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// ── GOOGLE OAUTH - LOGIN (akun harus sudah ada) ───────────────────────
/**
 * @swagger
 * /api/auth/google/login:
 *   get:
 *     summary: Redirect ke Google OAuth untuk login (akun harus sudah pernah terdaftar)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirect ke halaman consent Google
 */
router.get(
  "/google/login",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account", // ← harus ada ini
    state: "login",
  }),
);

// ── GOOGLE OAUTH - REGISTER (buat akun baru) ─────────────────────────
/**
 * @swagger
 * /api/auth/google/register:
 *   get:
 *     summary: Redirect ke Google OAuth untuk registrasi akun baru
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirect ke halaman consent Google
 */
router.get(
  "/google/register",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    prompt: "select_account",
    state: "register",
  }),
);

// ── GOOGLE CALLBACK ───────────────────────────────────────────────────
/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback URL dari Google OAuth (jangan dipanggil manual)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       302:
 *         description: Redirect ke frontend dengan JWT token di query string
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    const state = req.query.state;
    const user = req.user;

    // Kalau dari login page tapi akun tidak ada (baru dibuat) → error
    if (state === "login" && user._isNewUser) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=account_not_found`,
      );
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "rahasia123",
      { expiresIn: "7d" },
    );
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`);
  },
);

module.exports = router;
