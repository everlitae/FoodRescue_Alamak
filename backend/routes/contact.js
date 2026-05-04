const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

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

router.post("/", async (req, res) => {
  try {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "Semua field wajib diisi",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Format email tidak valid",
      });
    }

    if (message.length < 20) {
      return res.status(400).json({
        message: "Pesan terlalu pendek (min 20 karakter)",
      });
    }

    if (message.length > 1000) {
      return res.status(400).json({
        message: "Pesan terlalu panjang",
      });
    }

    await transporter.sendMail({
      from: `"FoodRescue Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `Pesan Baru: ${subject}`,
      html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5faf2;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5faf2;padding:40px 20px;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(60,100,40,0.10);">
            
            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#2e5220 0%,#5f8b4c 60%,#b8694a 100%);padding:32px 40px;text-align:center;">
                <img src="https://i.imgur.com/A0DGIrz.png" width="52" style="margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" />
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">FoodRescue</span>
                <div style="margin-top:10px;">
                  <span style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 14px;border-radius:20px;">
                    📬 PESAN BARU MASUK
                  </span>
                </div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:32px 40px;">
                <p style="margin:0 0 24px;font-size:15px;color:#3b5830;font-weight:700;">Halo, ada pesan baru dari pengguna! 👇</p>

                <!-- Info rows -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eef7e6;">
                      <span style="font-size:11px;color:#9ab88a;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Nama</span><br/>
                      <span style="font-size:14px;color:#1a2e14;font-weight:600;margin-top:2px;display:block;">${name}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eef7e6;">
                      <span style="font-size:11px;color:#9ab88a;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Email</span><br/>
                      <a href="mailto:${email}" style="font-size:14px;color:#5f8b4c;font-weight:600;margin-top:2px;display:block;text-decoration:none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;border-bottom:1px solid #eef7e6;">
                      <span style="font-size:11px;color:#9ab88a;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Kategori</span><br/>
                      <span style="font-size:14px;color:#1a2e14;font-weight:600;margin-top:2px;display:block;">${category}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:10px 0;">
                      <span style="font-size:11px;color:#9ab88a;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Subjek</span><br/>
                      <span style="font-size:14px;color:#1a2e14;font-weight:600;margin-top:2px;display:block;">${subject}</span>
                    </td>
                  </tr>
                </table>

                <!-- Message box -->
                <div style="margin-top:24px;">
                  <span style="font-size:11px;color:#9ab88a;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Pesan</span>
                  <div style="margin-top:8px;padding:18px 20px;background:#eef7e6;border-radius:12px;border-left:4px solid #5f8b4c;">
                    <p style="margin:0;font-size:14px;color:#3b5830;line-height:1.8;">${message}</p>
                  </div>
                </div>

                <!-- Reply button -->
                <div style="text-align:center;margin-top:28px;">
                  <a href="mailto:${email}" style="display:inline-block;background:linear-gradient(90deg,#5f8b4c,#7aaf60);color:#ffffff;font-size:13px;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
                    ✉️ Balas Pesan Ini
                  </a>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:20px 40px;background:#f5faf2;border-top:1px solid #eef7e6;text-align:center;">
                <p style="margin:0;font-size:11px;color:#9ab88a;">© 2026 FoodRescue · All rights reserved</p>
                <p style="margin:4px 0 0;font-size:11px;color:#b8d4a0;">Hubungi kami: <a href="mailto:foodrescue.indonesia@gmail.com" style="color:#7aaf60;text-decoration:none;">foodrescue.indonesia@gmail.com</a></p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `,
    });

    await transporter.sendMail({
      from: `"FoodRescue" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Pesan Anda sudah kami terima ✅",
      html: `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5faf2;font-family:Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5faf2;padding:40px 20px;">
        <tr><td align="center">
          <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(60,100,40,0.10);">
            
            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#2e5220 0%,#5f8b4c 60%,#b8694a 100%);padding:32px 40px;text-align:center;">
                <img src="https://i.imgur.com/A0DGIrz.png" width="52" style="margin-bottom:10px;display:block;margin-left:auto;margin-right:auto;" />
                <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">FoodRescue</span>
                <div style="margin-top:10px;">
                  <span style="display:inline-block;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);color:#fff;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 14px;border-radius:20px;">
                    ✅ PESAN DITERIMA
                  </span>
                </div>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:32px 40px;">
                <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:#1a2e14;">Halo ${name} 👋</p>
                <p style="margin:0 0 24px;font-size:14px;color:#6b8c5a;line-height:1.8;">
                  Terima kasih telah menghubungi <strong style="color:#3b5830;">FoodRescue</strong>. Kami sudah menerima pesan kamu dan akan segera merespons.
                </p>

                <!-- Summary box -->
                <div style="background:#eef7e6;border-radius:14px;padding:20px 24px;margin-bottom:24px;">
                  <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#9ab88a;text-transform:uppercase;letter-spacing:0.08em;">Ringkasan Pesanmu</p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-size:12px;color:#6b8c5a;padding:4px 0;width:80px;">Subjek</td>
                      <td style="font-size:12px;color:#1a2e14;font-weight:600;padding:4px 0;">${subject}</td>
                    </tr>
                    <tr>
                      <td style="font-size:12px;color:#6b8c5a;padding:4px 0;">Kategori</td>
                      <td style="font-size:12px;color:#1a2e14;font-weight:600;padding:4px 0;">${category}</td>
                    </tr>
                  </table>
                </div>

                <!-- Timeline info -->
                <div style="display:flex;align-items:flex-start;gap:12px;background:#fff8f0;border:1px solid #ffd580;border-radius:12px;padding:16px 20px;">
                  <span style="font-size:20px;">⏱️</span>
                  <div>
                    <p style="margin:0;font-size:13px;font-weight:700;color:#945034;">Estimasi Respons</p>
                    <p style="margin:4px 0 0;font-size:13px;color:#b8694a;line-height:1.6;">Tim kami akan membalas ke <strong>${email}</strong> dalam <strong>1×24 jam</strong> hari kerja.</p>
                  </div>
                </div>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding:20px 40px;background:#f5faf2;border-top:1px solid #eef7e6;text-align:center;">
                <p style="margin:0;font-size:13px;color:#6b8c5a;">Salam hangat,<br/><strong style="color:#3b5830;">Tim FoodRescue 🌿</strong></p>
                <p style="margin:12px 0 0;font-size:11px;color:#9ab88a;">© 2026 FoodRescue · All rights reserved</p>
                <p style="margin:4px 0 0;font-size:11px;color:#b8d4a0;">Pertanyaan? <a href="mailto:foodrescue.indonesia@gmail.com" style="color:#7aaf60;text-decoration:none;">foodrescue.indonesia@gmail.com</a></p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `,
    });

    res.json({ message: "Pesan berhasil dikirim" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal kirim pesan" });
  }
});

module.exports = router;
