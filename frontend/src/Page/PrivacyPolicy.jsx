import React, { Component } from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  {
    key: "pengumpulan",
    icon: "bi bi-database-fill",
    label: "Pengumpulan Data",
  },
  { key: "penggunaan", icon: "bi bi-gear-fill", label: "Penggunaan Data" },
  { key: "berbagi", icon: "bi bi-share-fill", label: "Berbagi Data" },
  { key: "keamanan", icon: "bi bi-shield-fill-check", label: "Keamanan Data" },
  { key: "hak", icon: "bi bi-person-check-fill", label: "Hak Pengguna" },
  { key: "cookie", icon: "bi bi-browser-chrome", label: "Cookie" },
  {
    key: "perubahan",
    icon: "bi bi-arrow-clockwise",
    label: "Perubahan Kebijakan",
  },
  { key: "kontak", icon: "bi bi-envelope-fill", label: "Hubungi Kami" },
];

const commitmentItems = [
  { icon: "bi bi-ban", text: "Tidak menjual data Anda" },
  { icon: "bi bi-lock", text: "Enkripsi end-to-end" },
  { icon: "bi bi-person-x", text: "Hapus akun kapan saja" },
  { icon: "bi bi-eye", text: "Transparan & terbuka" },
];

const heroTags = [
  { icon: "bi bi-calendar3", text: "Terakhir diperbarui: April 2026" },
  { icon: "bi bi-file-text", text: "Versi 2.0" },
  { icon: "bi bi-translate", text: "Bahasa Indonesia" },
];

class SectionPengumpulan extends Component {
  render() {
    const cards = [
      {
        icon: "bi bi-person-fill",
        title: "Data Identitas",
        desc: "Nama lengkap, alamat email, nomor telepon, dan foto profil yang Anda berikan saat mendaftar.",
      },
      {
        icon: "bi bi-geo-alt-fill",
        title: "Data Lokasi",
        desc: "Informasi lokasi pertanian atau wilayah kerja untuk mencocokkan layanan yang relevan di sekitar Anda.",
      },
      {
        icon: "bi bi-activity",
        title: "Data Aktivitas",
        desc: "Riwayat transaksi, ulasan yang diberikan, dan interaksi dalam platform kami.",
      },
      {
        icon: "bi bi-phone-fill",
        title: "Data Perangkat",
        desc: "Jenis perangkat, sistem operasi, alamat IP, dan data teknis lainnya untuk keamanan akun.",
      },
    ];
    return (
      <>
        <p
          className="outfit"
          style={{
            fontSize: 14,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          FoodRescue mengumpulkan berbagai jenis informasi untuk memberikan
          layanan terbaik. Informasi yang kami kumpulkan meliputi:
        </p>
        <div className="row g-3">
          {cards.map((c) => (
            <div className="col-12 col-sm-6" key={c.title}>
              <div className="card-basic rounded-3 p-3 d-flex gap-3 align-items-start h-100">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--g5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <i className={c.icon} style={{ color: "var(--g1)" }} />
                </div>
                <div>
                  <p
                    className="syne-h1"
                    style={{
                      fontSize: 13,
                      color: "var(--txt2)",
                      marginBottom: 3,
                    }}
                  >
                    {c.title}
                  </p>
                  <p
                    className="outfit"
                    style={{
                      fontSize: 12,
                      color: "var(--txt4)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {c.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}

class SectionPenggunaan extends Component {
  render() {
    const items = [
      {
        num: "01",
        title: "Menyediakan & Meningkatkan Layanan",
        desc: "Memproses pendaftaran, menampilkan profil, memfasilitasi transaksi, dan terus mengembangkan fitur platform.",
      },
      {
        num: "02",
        title: "Komunikasi & Notifikasi",
        desc: "Mengirim konfirmasi pesanan, pembaruan layanan, pengingat, dan informasi penting seputar akun Anda.",
      },
      {
        num: "03",
        title: "Personalisasi Pengalaman",
        desc: "Merekomendasikan layanan yang relevan berdasarkan lokasi, riwayat, dan preferensi Anda.",
      },
      {
        num: "04",
        title: "Keamanan & Pencegahan Penipuan",
        desc: "Mendeteksi aktivitas mencurigakan, melindungi akun, dan memastikan keamanan seluruh pengguna.",
      },
      {
        num: "05",
        title: "Analitik & Pengembangan",
        desc: "Memahami pola penggunaan untuk meningkatkan kualitas layanan dan pengalaman pengguna secara keseluruhan.",
      },
    ];
    return (
      <>
        <p
          className="outfit"
          style={{
            fontSize: 14,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          Informasi yang kami kumpulkan digunakan secara bertanggung jawab untuk
          tujuan berikut:
        </p>
        <div className="d-flex flex-column gap-2">
          {items.map((item) => (
            <div
              key={item.num}
              className="card-basic rounded-3 p-3 d-flex gap-3 align-items-start"
            >
              <span
                className="syne-h1"
                style={{
                  fontSize: 20,
                  fontWeight: 900,
                  color: "var(--g4)",
                  flexShrink: 0,
                  lineHeight: 1.2,
                }}
              >
                {item.num}
              </span>
              <div>
                <p
                  className="syne-h1"
                  style={{
                    fontSize: 13,
                    color: "var(--txt2)",
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </p>
                <p
                  className="outfit"
                  style={{
                    fontSize: 13,
                    color: "var(--txt3)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}

class SectionBerbagi extends Component {
  render() {
    const items = [
      {
        icon: "🤝",
        title: "Penyedia Layanan Terpercaya",
        desc: "Mitra teknis seperti penyedia hosting, layanan pembayaran, dan analitik yang terikat perjanjian kerahasiaan ketat.",
      },
      {
        icon: "⚖️",
        title: "Kewajiban Hukum",
        desc: "Apabila diwajibkan oleh hukum, regulasi, atau perintah pengadilan yang sah di wilayah hukum Indonesia.",
      },
      {
        icon: "🛡️",
        title: "Perlindungan Hak & Keamanan",
        desc: "Untuk melindungi hak, properti, atau keselamatan FoodRescue, pengguna kami, atau publik sesuai peraturan yang berlaku.",
      },
      {
        icon: "✅",
        title: "Persetujuan Eksplisit",
        desc: "Dalam situasi lain hanya jika Anda telah memberikan persetujuan eksplisit dan tertulis untuk berbagi data tersebut.",
      },
    ];
    return (
      <>
        <p
          className="outfit"
          style={{
            fontSize: 14,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          FoodRescue{" "}
          <strong style={{ color: "var(--g1)" }}>tidak menjual</strong> data
          pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi
          dalam kondisi terbatas berikut:
        </p>
        <div className="d-flex flex-column gap-2">
          {items.map((item) => (
            <div
              key={item.title}
              className="card-basic rounded-3 p-3 d-flex gap-3 align-items-start"
            >
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <p
                  className="syne-h1"
                  style={{
                    fontSize: 13,
                    color: "var(--txt2)",
                    marginBottom: 3,
                  }}
                >
                  {item.title}
                </p>
                <p
                  className="outfit"
                  style={{
                    fontSize: 13,
                    color: "var(--txt3)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}

class SectionKeamanan extends Component {
  render() {
    const cards = [
      {
        icon: "bi bi-lock-fill",
        label: "Enkripsi SSL/TLS",
        desc: "Seluruh transmisi data dienkripsi menggunakan protokol SSL/TLS terkini.",
      },
      {
        icon: "bi bi-key-fill",
        label: "Enkripsi Data",
        desc: "Kata sandi dan data sensitif disimpan dalam format terenkripsi dengan hashing yang kuat.",
      },
      {
        icon: "bi bi-eye-slash-fill",
        label: "Akses Terbatas",
        desc: "Hanya karyawan berwenang yang dapat mengakses data pengguna sesuai kebutuhan tugasnya.",
      },
      {
        icon: "bi bi-arrow-repeat",
        label: "Audit Berkala",
        desc: "Sistem keamanan kami diaudit dan diperbarui secara berkala oleh tim keamanan internal.",
      },
    ];
    return (
      <>
        <p
          className="outfit"
          style={{
            fontSize: 14,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang
          kuat untuk melindungi informasi Anda dari akses yang tidak sah.
        </p>
        <div className="row g-3 mb-3">
          {cards.map((c) => (
            <div className="col-6" key={c.label}>
              <div className="card-basic rounded-3 p-3 text-center h-100">
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: "var(--g5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 10px",
                  }}
                >
                  <i
                    className={c.icon}
                    style={{ color: "var(--g1)", fontSize: 18 }}
                  />
                </div>
                <p
                  className="syne-h1"
                  style={{
                    fontSize: 13,
                    color: "var(--txt2)",
                    marginBottom: 4,
                  }}
                >
                  {c.label}
                </p>
                <p
                  className="outfit"
                  style={{
                    fontSize: 12,
                    color: "var(--txt4)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {c.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="card-cream rounded-3 p-3 d-flex gap-2 align-items-start">
          <i
            className="bi bi-info-circle-fill"
            style={{ color: "var(--cr1)", marginTop: 2 }}
          />
          <p
            className="outfit"
            style={{
              fontSize: 13,
              color: "var(--txt3)",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Meskipun kami berupaya semaksimal mungkin, tidak ada sistem keamanan
            yang sepenuhnya sempurna. Gunakan kata sandi yang kuat dan jangan
            bagikan kepada siapapun.
          </p>
        </div>
      </>
    );
  }
}

class SectionHak extends Component {
  render() {
    const rights = [
      {
        icon: "bi bi-eye",
        color: "var(--g1)",
        bg: "var(--g5)",
        border: "var(--g1)",
        title: "Hak Akses",
        desc: "Anda berhak meminta salinan data pribadi yang kami simpan tentang Anda kapan saja.",
      },
      {
        icon: "bi bi-pencil",
        color: "var(--cr1)",
        bg: "var(--cr4)",
        border: "var(--cr1)",
        title: "Hak Koreksi",
        desc: "Anda dapat memperbarui atau memperbaiki data yang tidak akurat melalui pengaturan akun.",
      },
      {
        icon: "bi bi-trash",
        color: "var(--sa1)",
        bg: "var(--sa5)",
        border: "var(--sa1)",
        title: "Hak Penghapusan",
        desc: "Anda dapat meminta penghapusan akun dan data pribadi Anda, tunduk pada ketentuan hukum yang berlaku.",
      },
      {
        icon: "bi bi-hand-thumbs-down",
        color: "#1e7ab8",
        bg: "rgba(30,122,184,0.08)",
        border: "#1e7ab8",
        title: "Hak Menolak",
        desc: "Anda berhak menolak pemrosesan data untuk tujuan pemasaran langsung atau profiling tertentu.",
      },
      {
        icon: "bi bi-download",
        color: "var(--g1)",
        bg: "var(--g5)",
        border: "var(--g1)",
        title: "Hak Portabilitas",
        desc: "Anda dapat meminta ekspor data Anda dalam format yang dapat dibaca mesin sesuai permintaan.",
      },
    ];
    return (
      <>
        <p
          className="outfit"
          style={{
            fontSize: 14,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          Sebagai pengguna FoodRescue, Anda memiliki hak penuh atas data pribadi
          Anda, antara lain:
        </p>
        <div className="d-flex flex-column gap-2">
          {rights.map((r) => (
            <div
              key={r.title}
              className="card-basic rounded-3 p-3 d-flex gap-3 align-items-start"
              style={{ borderLeft: `3px solid ${r.border}` }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: r.bg,
                  color: r.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i className={r.icon} />
              </div>
              <div>
                <p
                  className="syne-h1"
                  style={{ fontSize: 13, color: r.color, marginBottom: 3 }}
                >
                  {r.title}
                </p>
                <p
                  className="outfit"
                  style={{
                    fontSize: 13,
                    color: "var(--txt3)",
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {r.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
}

class SectionCookie extends Component {
  render() {
    const rows = [
      {
        type: "Esensial",
        desc: "Diperlukan agar platform berfungsi dengan benar. Tidak dapat dinonaktifkan.",
        badge: "Selalu Aktif",
        badgeColor: "var(--g1)",
        badgeBg: "var(--g5)",
      },
      {
        type: "Fungsional",
        desc: "Menyimpan preferensi Anda seperti bahasa dan tema tampilan.",
        badge: "Opsional",
        badgeColor: "var(--cr1)",
        badgeBg: "var(--cr4)",
      },
      {
        type: "Analitik",
        desc: "Membantu kami memahami cara pengguna berinteraksi dengan platform.",
        badge: "Opsional",
        badgeColor: "var(--cr1)",
        badgeBg: "var(--cr4)",
      },
    ];
    return (
      <>
        <p
          className="outfit"
          style={{
            fontSize: 14,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          FoodRescue menggunakan cookie dan teknologi serupa untuk meningkatkan
          pengalaman pengguna dan menganalisis cara platform kami digunakan.
        </p>
        <div className="card-basic rounded-3 overflow-hidden mb-3">
          {rows.map((row, i) => (
            <div
              key={row.type}
              className="d-flex align-items-center gap-3 px-3 py-3"
              style={{
                borderBottom:
                  i < rows.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <div style={{ flex: 1 }}>
                <p
                  className="syne-h1"
                  style={{
                    fontSize: 13,
                    color: "var(--txt2)",
                    marginBottom: 2,
                  }}
                >
                  {row.type}
                </p>
                <p
                  className="outfit"
                  style={{
                    fontSize: 12,
                    color: "var(--txt4)",
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {row.desc}
                </p>
              </div>
              <span
                className="badge-green outfit"
                style={{
                  background: row.badgeBg,
                  color: row.badgeColor,
                  border: `1px solid ${row.badgeColor}`,
                  padding: "3px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                {row.badge}
              </span>
            </div>
          ))}
        </div>
        <p
          className="outfit"
          style={{
            fontSize: 13,
            color: "var(--txt3)",
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          Anda dapat mengatur preferensi cookie melalui pengaturan browser.
          Namun, menonaktifkan cookie esensial dapat memengaruhi fungsionalitas
          platform.
        </p>
      </>
    );
  }
}

class SectionPerubahan extends Component {
  render() {
    const timeline = [
      {
        date: "Maret 2026",
        label: "Versi 1.0 — Peluncuran awal kebijakan privasi FoodRescue.",
      },
      {
        date: "April 2026",
        label: "Versi 1.1 — Penambahan ketentuan cookie dan pelacakan.",
      },
      {
        date: "April 2026",
        label: "Versi 1.2 — Pembaruan hak pengguna sesuai regulasi terbaru.",
      },
      {
        date: "Mei 2026",
        label: "Versi 2.0 — Revisi menyeluruh dan peningkatan transparansi.",
      },
    ];
    return (
      <>
        <p
          className="outfit"
          style={{
            fontSize: 14,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 20,
          }}
        >
          Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu untuk
          mencerminkan perubahan layanan, teknologi, atau persyaratan hukum yang
          berlaku.
        </p>
        <div
          className="about-timeline"
          style={{ maxWidth: "100%", margin: "0 0 20px" }}
        >
          {timeline.map((item, i) => (
            <div key={item.date} className="about-timeline__item">
              <div className="about-timeline__left">
                <div
                  className="about-timeline__circle"
                  style={{ fontSize: 13 }}
                >
                  📋
                </div>
                {i < timeline.length - 1 && (
                  <div className="about-timeline__line" />
                )}
              </div>
              <div />
              <div className="pt-1">
                <div className="about-timeline__date">{item.date}</div>
                <p className="outfit about-timeline__desc">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="card-green rounded-3 p-3 d-flex gap-2 align-items-start">
          <i
            className="bi bi-bell-fill"
            style={{ color: "var(--g1)", marginTop: 2 }}
          />
          <p
            className="outfit"
            style={{
              fontSize: 13,
              color: "var(--txt3)",
              margin: 0,
              lineHeight: 1.7,
            }}
          >
            Setiap perubahan signifikan akan kami beritahukan melalui email
            terdaftar atau notifikasi di dalam aplikasi sebelum perubahan
            berlaku efektif.
          </p>
        </div>
      </>
    );
  }
}

class SectionKontak extends Component {
  render() {
    const contacts = [
      {
        icon: "bi bi-envelope-fill",
        color: "var(--g1)",
        bg: "var(--g5)",
        border: "1px solid var(--g3)",
        label: "Email Privasi",
        value: "privacy@foodrescue.id",
        note: "Respons dalam 2×24 jam kerja",
      },
      {
        icon: "bi bi-whatsapp",
        color: "var(--cr1)",
        bg: "var(--cr4)",
        border: "1px solid var(--cr3)",
        label: "WhatsApp Support",
        value: "+62 812-3456-7890",
        note: "Senin–Jumat, 08.00–17.00 WIB",
      },
    ];
    return (
      <>
        <p
          className="outfit"
          style={{
            fontSize: 14,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 16,
          }}
        >
          Jika Anda memiliki pertanyaan, kekhawatiran, atau permintaan terkait
          Kebijakan Privasi atau data pribadi Anda, silakan hubungi Tim Privasi
          FoodRescue melalui:
        </p>
        <div className="d-flex flex-column gap-3 mb-3">
          {contacts.map((c) => (
            <div
              key={c.label}
              className="rounded-3 d-flex align-items-center gap-3 p-3"
              style={{ background: c.bg, border: c.border }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "var(--surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  color: c.color,
                  flexShrink: 0,
                  boxShadow: "var(--shadow)",
                }}
              >
                <i className={c.icon} />
              </div>
              <div>
                <p
                  className="outfit"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--txt4)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 2,
                  }}
                >
                  {c.label}
                </p>
                <p
                  className="syne-h1"
                  style={{ fontSize: 15, color: "var(--txt)", marginBottom: 2 }}
                >
                  {c.value}
                </p>
                <p
                  className="outfit"
                  style={{ fontSize: 12, color: "var(--txt3)", margin: 0 }}
                >
                  {c.note}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p
          className="outfit"
          style={{
            fontSize: 13,
            color: "var(--txt3)",
            lineHeight: 1.75,
            margin: 0,
          }}
        >
          Kami berkomitmen untuk merespons setiap permintaan terkait privasi
          dengan serius dan dalam jangka waktu yang wajar sesuai peraturan yang
          berlaku.
        </p>
      </>
    );
  }
}

// ─── Accordion Item ──────────────────────────────────────────────────────────

class AccordionItem extends Component {
  render() {
    const { section, isOpen, isRead, onToggle } = this.props;
    return (
      <div
        style={{
          background: "var(--surface)",
          border: `1.5px solid ${isOpen ? "var(--g2)" : "var(--border)"}`,
          borderRadius: 18,
          marginBottom: 14,
          overflow: "hidden",
          boxShadow: isOpen ? "var(--shadow2)" : "var(--shadow)",
          transition: "border-color 0.25s, box-shadow 0.25s",
        }}
      >
        {/* Header */}
        <div
          onClick={onToggle}
          className="d-flex align-items-center gap-3 px-4"
          style={{
            padding: "20px 24px",
            cursor: "pointer",
            background: isOpen ? "var(--g5)" : "var(--surface)",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: section.iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              color: section.iconColor,
              flexShrink: 0,
            }}
          >
            <i className={section.icon} />
          </div>

          <div style={{ flex: 1 }}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className={`faq-tag ${section.tagCls}`}>
                {section.tagLabel}
              </span>
              {isRead && !isOpen && (
                <span
                  className="outfit"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--g1)",
                    background: "var(--g5)",
                    border: "1px solid var(--g3)",
                    borderRadius: 20,
                    padding: "2px 8px",
                  }}
                >
                  ✓ Sudah dibaca
                </span>
              )}
            </div>
            <p
              className="syne-h1"
              style={{
                fontSize: 15,
                color: isOpen ? "var(--g1)" : "var(--txt)",
                margin: 0,
              }}
            >
              {section.title}
            </p>
          </div>

          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: isOpen ? "var(--g1)" : "var(--surf2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              transition: "all 0.3s",
              transform: isOpen ? "rotate(180deg)" : "none",
            }}
          >
            <i
              className="bi bi-chevron-down"
              style={{ fontSize: 13, color: isOpen ? "#fff" : "var(--txt4)" }}
            />
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            maxHeight: isOpen ? 2000 : 0,
            overflow: "hidden",
            transition: "max-height 0.4s ease",
          }}
        >
          <div
            style={{
              padding: "24px 28px 28px",
              borderTop: "1px solid var(--border)",
            }}
          >
            {section.content}
          </div>
        </div>
      </div>
    );
  }
}

// ─── Main Component ──────────────────────────────────────────────────────────

class PrivacyPolicy extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // null = show all, otherwise the key of the active single section
      activeSection: null,
      // which section accordion is open (for single-view mode)
      openSection: null,
      readSections: new Set(),
    };
  }

  // Toggle between show-all and single-section view
  selectSection = (key) => {
    this.setState((prev) => {
      const readSections = new Set(prev.readSections);
      readSections.add(key);

      return {
        activeSection: key,
        openSection: key,
        readSections,
      };
    });

    // 🔥 scroll ke section
    setTimeout(() => {
      const el = document.getElementById(key);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  showAll = () => {
    this.setState({ activeSection: null, openSection: null });

    setTimeout(() => {
      const firstSection = document.getElementById(navItems[0].key);
      if (firstSection) {
        firstSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 100);
  };

  // In "show all" mode the accordion items still open/close individually
  toggleAccordion = (key) => {
    this.setState((prev) => {
      const readSections = new Set(prev.readSections);
      readSections.add(key);
      return {
        openSection: prev.openSection === key ? null : key,
        readSections,
      };
    });
  };

  render() {
    const { activeSection, openSection, readSections } = this.state;
    const totalSections = navItems.length;
    const readCount = readSections.size;
    const readProgress = Math.round((readCount / totalSections) * 100);

    const sections = [
      {
        key: "pengumpulan",
        icon: "bi bi-database-fill",
        iconBg: "var(--g5)",
        iconColor: "var(--g1)",
        title: "Informasi yang Kami Kumpulkan",
        tagLabel: "Data & Privasi",
        tagCls: "tag-g",
        content: <SectionPengumpulan />,
      },
      {
        key: "penggunaan",
        icon: "bi bi-gear-fill",
        iconBg: "var(--cr4)",
        iconColor: "var(--cr1)",
        title: "Bagaimana Kami Menggunakan Informasi Anda",
        tagLabel: "Penggunaan",
        tagCls: "tag-cr",
        content: <SectionPenggunaan />,
      },
      {
        key: "berbagi",
        icon: "bi bi-share-fill",
        iconBg: "rgba(30,122,184,0.08)",
        iconColor: "#1e7ab8",
        title: "Berbagi & Pengungkapan Data",
        tagLabel: "Transparansi",
        tagCls: "tag-g",
        content: <SectionBerbagi />,
      },
      {
        key: "keamanan",
        icon: "bi bi-shield-fill-check",
        iconBg: "var(--g5)",
        iconColor: "var(--g1)",
        title: "Keamanan Data",
        tagLabel: "Perlindungan",
        tagCls: "tag-g",
        content: <SectionKeamanan />,
      },
      {
        key: "hak",
        icon: "bi bi-person-check-fill",
        iconBg: "var(--cr4)",
        iconColor: "var(--cr1)",
        title: "Hak-Hak Pengguna",
        tagLabel: "Hak Anda",
        tagCls: "tag-cr",
        content: <SectionHak />,
      },
      {
        key: "cookie",
        icon: "bi bi-browser-chrome",
        iconBg: "rgba(30,122,184,0.08)",
        iconColor: "#1e7ab8",
        title: "Cookie & Teknologi Pelacakan",
        tagLabel: "Cookie",
        tagCls: "tag-g",
        content: <SectionCookie />,
      },
      {
        key: "perubahan",
        icon: "bi bi-arrow-clockwise",
        iconBg: "var(--g5)",
        iconColor: "var(--g1)",
        title: "Perubahan Kebijakan Privasi",
        tagLabel: "Pembaruan",
        tagCls: "tag-g",
        content: <SectionPerubahan />,
      },
      {
        key: "kontak",
        icon: "bi bi-envelope-fill",
        iconBg: "var(--cr4)",
        iconColor: "var(--cr1)",
        title: "Hubungi Kami",
        tagLabel: "Kontak",
        tagCls: "tag-cr",
        content: <SectionKontak />,
      },
    ];

    const visibleSections = activeSection
      ? sections.filter((s) => s.key === activeSection)
      : sections;

    return (
      <div className="main-bg-color" style={{ minHeight: "100vh" }}>
        <section className="about-hero position-relative">
          <div
            className="grid-detail-light position-absolute"
            style={{ inset: 0 }}
          />
          <button
            onClick={() => this.props.navigate(-1)}
            className="outfit"
            style={{
              position: "absolute",
              top: 18,
              right: 20,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: 10,
              padding: "7px 14px",
              fontSize: 13,
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.25)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.15)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
            }}
          >
            <i className="bi bi-arrow-left" style={{ fontSize: 12 }} />
            Kembali
            </button>
          <div className="container about-hero__inner py-0 px-4 px-md-5">
          
            <div className="row align-items-center g-3">
              {/* Left */}
              <div className="col-lg-8">
                <div className="about-hero-badge mb-2">
                  <i className="bi bi-shield-lock-fill" />
                  <span>Kebijakan Privasi</span>
                </div>

                <h1
                  className="syne-h1"
                  style={{
                    fontSize: "clamp(26px, 4vw, 44px)",
                    color: "#fff",
                    lineHeight: 1.15,
                    marginBottom: 10,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Privasi Anda adalah
                  <br />
                  <span
                    style={{
                      background: "linear-gradient(135deg,#fff,var(--cr3))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Prioritas Kami
                  </span>
                </h1>

                <p
                  className="outfit"
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.75,
                    maxWidth: 520,
                    marginBottom: 16,
                  }}
                >
                  Dokumen ini menjelaskan bagaimana FoodRescue mengumpulkan,
                  menggunakan, dan melindungi informasi pribadi Anda. Kami
                  berkomitmen penuh pada transparansi dan keamanan data.
                </p>

                <div className="d-flex flex-wrap gap-2">
                  {heroTags.map((tag) => (
                    <span key={tag.text} className="about-hero__tag outfit">
                      <i className={tag.icon} style={{ fontSize: 11 }} />
                      {tag.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — Commitment card */}
              <div className="col-lg-4">
                <div className="card-transparent rounded-4 p-3">
                  <p
                    className="outfit"
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "rgba(255,255,255,0.55)",
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      marginBottom: 10,
                    }}
                  >
                    Ringkasan Komitmen
                  </p>
                  {commitmentItems.map((item, i) => (
                    <div
                      key={item.text}
                      className="d-flex align-items-center gap-3"
                      style={{
                        padding: "8px 0",
                        borderBottom:
                          i < commitmentItems.length - 1
                            ? "1px solid rgba(255,255,255,0.1)"
                            : "none",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: "rgba(255,255,255,0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        <i className={item.icon} />
                      </div>
                      <span
                        className="outfit"
                        style={{
                          fontSize: 13,
                          color: "rgba(255,255,255,0.85)",
                          fontWeight: 600,
                        }}
                      >
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <div
          className="container px-3 px-md-4"
          style={{ padding: "48px 0 80px" }}
        >
          <div className="row g-4 align-items-start">
            {/* ── Sidebar ── sticky via position:sticky ── */}
            <div
              className="col-lg-3 d-none d-lg-block"
              style={{
                position: "sticky",
                top: 100,
                alignSelf: "flex-start",
                height: "fit-content",
              }}
            >
              <aside className="faq-sidebar">
                {/* Daftar Isi label */}
                <p
                  className="outfit"
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "var(--txt4)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    marginBottom: 10,
                    padding: "0 4px",
                  }}
                >
                  Daftar Isi
                </p>

                {/* Read Progress */}
                <div className="card-basic rounded-3 p-3 mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span
                      className="outfit"
                      style={{ fontSize: 11, color: "var(--txt4)" }}
                    >
                      Progress baca
                    </span>
                    <span
                      className="syne-h1"
                      style={{ fontSize: 11, color: "var(--g1)" }}
                    >
                      {readCount}/{totalSections}
                    </span>
                  </div>
                  <div className="pw-str">
                    <div
                      className="pw-fill"
                      style={{
                        width: `${readProgress}%`,
                        background:
                          "linear-gradient(90deg, var(--g1), var(--g2))",
                      }}
                    />
                  </div>
                  <p className="outfit pw-hint" style={{ marginBottom: 0 }}>
                    {readProgress === 100
                      ? "🎉 Semua sudah dibaca!"
                      : `${readCount} dari ${totalSections} bagian dibaca`}
                  </p>
                </div>

                {/* "Tampilkan Semua" button */}
                <button
                  onClick={this.showAll}
                  className="outfit"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    color: activeSection === null ? "var(--g1)" : "var(--txt3)",
                    marginBottom: 6,
                    border:
                      activeSection === null
                        ? "1px solid rgba(95,139,76,.2)"
                        : "1px solid transparent",
                    background: activeSection === null ? "var(--g5)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    boxSizing: "border-box",
                  }}
                >
                  <div
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 7,
                      background:
                        activeSection === null ? "var(--g1)" : "var(--surf2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      flexShrink: 0,
                      color: activeSection === null ? "#fff" : "var(--txt4)",
                    }}
                  >
                    <i className="bi bi-grid-fill" />
                  </div>
                  <span style={{ flex: 1 }}>Tampilkan Semua</span>
                </button>

                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: "var(--border)",
                    margin: "6px 4px 8px",
                  }}
                />

                {/* Nav links */}
                {navItems.map((item) => {
                  const isRead = readSections.has(item.key);
                  const isActive = activeSection === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => this.selectSection(item.key)}
                      className="outfit"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                        color: isActive ? "var(--g1)" : "var(--txt3)",
                        marginBottom: 2,
                        border: isActive
                          ? "1px solid rgba(95,139,76,.2)"
                          : "1px solid transparent",
                        background: isActive ? "var(--g5)" : "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.2s",
                        boxSizing: "border-box",
                      }}
                    >
                      <div
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 7,
                          background: isActive
                            ? "var(--g1)"
                            : isRead
                              ? "var(--g4)"
                              : "var(--surf2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          flexShrink: 0,
                          color: isActive
                            ? "#fff"
                            : isRead
                              ? "var(--g1)"
                              : "var(--txt4)",
                        }}
                      >
                        <i
                          className={
                            isRead && !isActive ? "bi bi-check-lg" : item.icon
                          }
                        />
                      </div>
                      <span style={{ flex: 1 }}>{item.label}</span>
                    </button>
                  );
                })}
              </aside>
            </div>

            {/* ── Main content ── */}
            <div className="col-lg-9">
              <div id="top" />
              <div
                className="card-green rounded-3 d-flex gap-3 align-items-start mb-4"
                style={{ padding: "20px 24px" }}
              >
                <i
                  className="bi bi-info-circle-fill"
                  style={{
                    color: "var(--g1)",
                    fontSize: 20,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <div>
                  <p
                    className="syne-h1"
                    style={{
                      fontSize: 14,
                      color: "var(--txt2)",
                      marginBottom: 4,
                    }}
                  >
                    Sebelum Anda mulai membaca
                  </p>
                  <p
                    className="outfit"
                    style={{
                      fontSize: 13,
                      color: "var(--txt3)",
                      lineHeight: 1.75,
                      margin: 0,
                    }}
                  >
                    Kebijakan Privasi ini berlaku untuk seluruh layanan
                    FoodRescue, termasuk aplikasi web, aplikasi mobile, dan
                    layanan terkait. Pilih bagian di sebelah kiri untuk membaca
                    satu topik, atau klik{" "}
                    <strong style={{ color: "var(--g1)" }}>
                      Tampilkan Semua
                    </strong>{" "}
                    untuk melihat keseluruhan.
                  </p>
                </div>
              </div>

              {/* Section heading when viewing a single section */}
              {activeSection && (
                <div className="d-flex align-items-center gap-2 mb-3">
                  <button
                    onClick={this.showAll}
                    className="outfit"
                    style={{
                      background: "var(--surf2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "5px 12px",
                      fontSize: 12,
                      color: "var(--txt3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <i className="bi bi-arrow-left" /> Tampilkan Semua
                  </button>
                  <span
                    className="outfit"
                    style={{ fontSize: 12, color: "var(--txt4)" }}
                  >
                    / {navItems.find((n) => n.key === activeSection)?.label}
                  </span>
                </div>
              )}

              {/* Accordion sections */}
              {visibleSections.map((section) => (
                <div id={section.key} className="faq-main">
                  <AccordionItem
                    key={section.key}
                    section={section}
                    isOpen={
                      activeSection
                        ? section.key === activeSection
                        : openSection === section.key
                    }
                    isRead={readSections.has(section.key)}
                    onToggle={() => {
                      if (activeSection) {
                        this.showAll();
                      } else {
                        this.toggleAccordion(section.key);
                      }
                    }}
                  />
                </div>
              ))}

              {/* CTA bottom */}
              <div
                className="about-impact position-relative overflow-hidden rounded-4 text-center mt-4"
                style={{ padding: "48px 36px" }}
              >
                <div
                  className="grid-detail-light position-absolute"
                  style={{ inset: 0 }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 16,
                      background: "rgba(255,255,255,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 26,
                      color: "#fff",
                      margin: "0 auto 16px",
                    }}
                  >
                    <i className="bi bi-shield-fill-check" />
                  </div>
                  <h3 className="syne-h1 about-impact__title">
                    Anda Terlindungi Bersama FoodRescue
                  </h3>
                  <p
                    className="outfit about-impact__subtitle mx-auto mb-4"
                    style={{ maxWidth: 480 }}
                  >
                    Dengan terus menggunakan layanan kami, Anda menyetujui
                    Kebijakan Privasi ini. Jika ada pertanyaan, tim kami siap
                    membantu kapan saja.
                  </p>
                  <div className="d-flex gap-3 justify-content-center flex-wrap">
                    <button
                      className="faq-help-box__btn-primary outfit"
                      onClick={() => this.props.navigate("/contact")}
                    >
                      <i className="bi bi-envelope" /> Hubungi Kami
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function PrivacyPolicyWrapper(props) {
  const navigate = useNavigate();
  return <PrivacyPolicy {...props} navigate={navigate} />;
}
export default PrivacyPolicyWrapper;
