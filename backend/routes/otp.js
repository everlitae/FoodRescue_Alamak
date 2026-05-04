const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const Otp = require("../models/Otp");
const User = require("../models/User");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return res.status(400).json({ message: "Email tidak valid" });
    }

    const emailLower = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailLower });

    if (!user) {
      return res.status(400).json({
        message: "Email tidak terdaftar",
      });
    }

    const existing = await Otp.findOne({ email: emailLower });

    if (existing) {
      const diff = (new Date() - existing.createdAt) / 1000;

      if (diff < 60) {
        return res.status(400).json({
          message: "Tunggu 1 menit sebelum kirim ulang OTP",
        });
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

    await Otp.deleteMany({ email: emailLower });

    await Otp.create({
      email: emailLower,
      otp: hashedOtp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    try {
      await transporter.sendMail({
        from: `"FoodRescue Support" <${process.env.EMAIL_USER}>`,
        to: emailLower,
        subject: "OTP Reset Password",
        html: `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>OTP Reset Password</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&display=swap" rel="stylesheet" />
</head>

<body style="margin:0;padding:0;background-color:#f5faf2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Roboto','Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5faf2;">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;background-color:#ffffff;border-radius:20px;box-shadow:0 8px 48px rgba(60,100,40,.26);overflow:hidden;">

          <!-- HEADER: gradient full dengan logo + brand + badge di dalamnya -->
          <tr>
            <td style="background:linear-gradient(155deg,#2e5220 0%,#5f8b4c 50%,#b8694a 100%);padding:36px 30px 30px;text-align:center;">

              <!-- Logo + Brand name berdampingan -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;">
                <tr>
                  <!-- Logo dengan background putih transparan agar terlihat rapi di atas gradient -->
                  <td style="vertical-align:middle;padding-right:12px;">
                    <div style="width:52px;height:52px;background:rgba(255,255,255,0.95);border-radius:14px;display:inline-block;text-align:center;line-height:52px;box-shadow:0 4px 16px rgba(0,0,0,0.15);">
                      <img
                        src="https://res.cloudinary.com/dt7qzcics/image/upload/v1777415977/foodrescue_logo_only_w3uqez.png"
                        alt="FoodRescue"
                        width="36"
                        height="36"
                        style="display:inline-block;vertical-align:middle;"
                      />
                    </div>
                  </td>
                  <!-- Brand name: Syne 800, putih di atas gradient -->
                  <td style="vertical-align:middle;">
                    <span style="font-family:'Syne',sans-serif;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:0.2px;display:block;line-height:1;text-shadow:0 1px 8px rgba(0,0,0,0.15);">FoodRescue</span>
                  </td>
                </tr>
              </table>

              <!-- Badge pill -->
              <span style="display:inline-block;background:rgba(255,255,255,0.14);border:1px solid rgba(255,255,255,0.32);color:#ffffff;font-size:10px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;padding:7px 20px;border-radius:999px;">
                🔐&nbsp;&nbsp;Reset Password
              </span>

            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:32px 30px 24px;">

              <p style="margin:0 0 4px 0;padding:0;font-size:18px;font-weight:800;color:#1a2e14;letter-spacing:-0.3px;">Halo! 👋</p>
              <p style="margin:0 0 26px 0;padding:0;font-size:14px;color:#6b8c5a;line-height:1.8;">
                Kami menerima permintaan untuk mereset password akun FoodRescue kamu.
                Gunakan kode OTP berikut untuk melanjutkan proses reset password.
              </p>

              <!-- OTP BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
                <tr>
                  <td style="background:linear-gradient(160deg,#eef7e6 0%,#d4efbf 100%);border:2px solid #a8d48a;border-radius:16px;padding:24px 20px 20px;text-align:center;box-shadow:0 2px 20px rgba(60,100,40,.20);">
                    <p style="margin:0 0 12px 0;padding:0;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#6b8c5a;">
                      Kode OTP Kamu
                    </p>
                    <div style="font-size:46px;font-weight:900;letter-spacing:16px;text-indent:16px;color:#5f8b4c;line-height:1;font-family:'Courier New',Courier,monospace;margin-bottom:16px;">
                      ${otp}
                    </div>
                    <span style="display:inline-block;background:#eef7e6;border:1px solid #6b8c5a;border-radius:999px;padding:5px 14px;font-size:11px;font-weight:700;color:#6b8c5a;letter-spacing:0.04em;">
                      ⏱&nbsp; Berlaku selama <strong>5 menit</strong>
                    </span>
                  </td>
                </tr>
              </table>

              <!-- STEPS CARD -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f7e9;border:1px solid rgba(95,139,76,.16);border-radius:14px;margin-bottom:18px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 18px 8px;">
                    <p style="margin:0;padding:0;font-size:10px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:#3b5830;">
                      📋&nbsp; Cara Menggunakan Kode Ini
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 18px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="26" height="26" style="min-width:26px;width:26px;height:26px;background:linear-gradient(135deg,#5f8b4c,#7aaf60);border-radius:50%;text-align:center;vertical-align:middle;font-size:11px;font-weight:800;color:#ffffff;line-height:26px;">1</td>
                        <td style="padding-left:10px;font-size:13px;color:#3b5830;vertical-align:middle;line-height:1.5;">Buka halaman reset password di aplikasi</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="padding:0 18px 0 54px;"><div style="height:1px;background:rgba(95,139,76,.12);"></div></td></tr>
                <tr>
                  <td style="padding:6px 18px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="26" height="26" style="min-width:26px;width:26px;height:26px;background:linear-gradient(135deg,#5f8b4c,#7aaf60);border-radius:50%;text-align:center;vertical-align:middle;font-size:11px;font-weight:800;color:#ffffff;line-height:26px;">2</td>
                        <td style="padding-left:10px;font-size:13px;color:#3b5830;vertical-align:middle;line-height:1.5;">Masukkan kode OTP di atas pada kolom yang tersedia</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr><td style="padding:0 18px 0 54px;"><div style="height:1px;background:rgba(95,139,76,.12);"></div></td></tr>
                <tr>
                  <td style="padding:6px 18px 14px;">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="26" height="26" style="min-width:26px;width:26px;height:26px;background:linear-gradient(135deg,#5f8b4c,#7aaf60);border-radius:50%;text-align:center;vertical-align:middle;font-size:11px;font-weight:800;color:#ffffff;line-height:26px;">3</td>
                        <td style="padding-left:10px;font-size:13px;color:#3b5830;vertical-align:middle;line-height:1.5;">Buat password baru yang kuat dan mudah diingat</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- WARNING BOX -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff3d9;border:1px solid #ffddab;border-radius:12px;overflow:hidden;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;padding:0;font-size:12px;color:#945034;line-height:1.75;">
                      ⚠️ <strong>Jangan bagikan kode ini</strong> ke siapa pun, termasuk tim FoodRescue.
                      Jika kamu tidak meminta reset password, abaikan email ini — akun kamu tetap aman.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 30px;">
              <div style="height:1px;background:rgba(95,139,76,.16);"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#edf5e6;padding:18px 30px 24px;text-align:center;">
              <p style="margin:0 0 6px 0;padding:0;font-size:12px;color:#9ab88a;line-height:1.8;">
                Email ini dikirim secara otomatis oleh sistem FoodRescue.<br />
                Pertanyaan? Hubungi kami di&nbsp;
                <a href="mailto:foodrescue.indonesia@gmail.com" style="color:#5f8b4c;font-weight:700;text-decoration:none;">foodrescue.indonesia@gmail.com</a>
              </p>
              <div style="height:1px;background:rgba(95,139,76,.14);margin:12px 0;"></div>
              <p style="margin:0;padding:0;font-size:11px;color:#9ab88a;">© 2026 FoodRescue • All rights reserved</p>
            </td>
          </tr>

        </table>

        <p style="margin:18px 0 0;padding:0;font-size:11px;color:#9ab88a;text-align:center;">
          Kamu menerima email ini karena terdaftar di FoodRescue Indonesia.
        </p>

      </td>
    </tr>
  </table>

</body>
</html>
      `,
      });
    } catch (mailErr) {
      await Otp.deleteMany({ email: emailLower });
      console.error("Mail error:", mailErr);
      return res.status(500).json({ message: "Gagal kirim email OTP" });
    }

    res.json({ message: "OTP berhasil dikirim" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal kirim OTP" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email dan OTP wajib diisi",
      });
    }

    const emailLower = email.trim().toLowerCase();

    const record = await Otp.findOne({ email: emailLower });

    if (!record) {
      return res.status(400).json({ message: "OTP salah atau expired" });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteMany({ email: emailLower });

      return res.status(400).json({ message: "OTP salah atau expired" });
    }

    const isMatch = await bcrypt.compare(otp, record.otp);

    if (!isMatch) {
      record.attempts += 1;

      if (record.attempts >= record.maxAttempts) {
        await Otp.deleteMany({ email: emailLower });

        return res.status(400).json({
          message: "Terlalu banyak percobaan. Minta OTP baru.",
        });
      }

      await record.save();
      return res.status(400).json({ message: "OTP salah" });
    }

    await Otp.deleteMany({ email: emailLower });

    res.json({ message: "OTP valid" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
