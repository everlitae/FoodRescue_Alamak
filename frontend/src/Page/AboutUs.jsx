import React from "react";
import { useNavigate } from "react-router-dom";

const missionStatsData = [
  { emoji: "🍱", number: "2.4K+", label: "Donasi berhasil", colorClass: "" },
  {
    emoji: "🤝",
    number: "8.2K+",
    label: "Penerima manfaat",
    colorClass: "about-stat-card--cream",
  },
  {
    emoji: "♻️",
    number: "12T kg",
    label: "Makanan diselamatkan",
    colorClass: "about-stat-card--red",
  },
  {
    emoji: "🌍",
    number: "42",
    label: "Kota terjangkau",
    colorClass: "about-stat-card--blue",
  },
];

const valuesData = [
  {
    number: "01",
    emoji: "🌿",
    title: "Keberlanjutan",
    desc: "Kami ingin menciptakan sistem pangan yang lebih baik dan berkelanjutan untuk semua.",
  },
  {
    number: "02",
    emoji: "💚",
    title: "Inklusivitas",
    desc: "Platform ini dibuat agar mudah digunakan oleh siapa saja.",
  },
  {
    number: "03",
    emoji: "🔍",
    title: "Transparansi",
    desc: "Kami memastikan setiap proses transparan dan dapat dipercaya.",
  },
  {
    number: "04",
    emoji: "⚡",
    title: "Efisiensi",
    desc: "Kami mengoptimalkan teknologi agar distribusi makanan lebih cepat dan tepat.",
  },
];

const teamData = [
  {
    emoji: "👩‍💻",
    name: "Pauline Angelicca",
    nim: "241112931",
    avatarBg: "linear-gradient(135deg,#dff0c8,#b8e890)",
  },
  {
    emoji: "👨‍💻",
    name: "John Herbert",
    nim: "241112170",
    avatarBg: "linear-gradient(135deg,#fff5e0,#ffd580)",
  },
  {
    emoji: "👩‍🎨",
    name: "Everlita Evenlyn",
    nim: "241110842",
    avatarBg: "linear-gradient(135deg,#f0ecff,#d0c0f8)",
  },
  {
    emoji: "👨‍🎨",
    name: "Jerisco Geraldine",
    nim: "241111817",
    avatarBg: "linear-gradient(135deg,#f0ffe0,#b8e890)",
  },
];

const timelineData = [
  {
    emoji: "💡",
    date: "Februari 2025",
    title: "Ide Awal",
    desc: "Tim mulai melihat masalah food waste dan mencari solusi yang bisa membantu banyak orang.",
    isLast: false,
  },
  {
    emoji: "🎨",
    date: "Maret 2025",
    title: "Perancangan",
    desc: "Kami merancang tampilan dan pengalaman pengguna agar mudah digunakan.",
    isLast: false,
  },
  {
    emoji: "⚙️",
    date: "April 2025",
    title: "Pengembangan",
    desc: "Fitur mulai dikembangkan secara bertahap dan terus diperbaiki.",
    isLast: false,
  },
  {
    emoji: "🚀",
    date: "Mei 2025",
    title: "Peluncuran",
    desc: "Platform mulai digunakan dan memberikan dampak nyata bagi masyarakat.",
    isLast: true,
  },
];

const impactStatsData = [
  { number: "2,481", label: "Total Donasi" },
  { number: "8,200+", label: "Penerima Terbantu" },
  { number: "12T kg", label: "Makanan Diselamatkan" },
  { number: "~30T kg", label: "CO2 Dihemat" },
  { number: "800+", label: "Relawan Aktif" },
  { number: "42", label: "Kota Terjangkau" },
];

class AboutHero extends React.Component {
  render() {
    return (
      <section className="about-hero">
        <div className="container-md about-hero__inner py-5 px-4 px-md-5">
          <div className="about-hero-badge mb-3">
            <i className="bi bi-info-circle-fill"></i>
            <span>Tentang Kami</span>
          </div>

          <h1 className="syne-h1 about-hero__title">
            Menyelamatkan Makanan,
            <br />
            <span>Membantu Sesama</span>
          </h1>

          <p className="about-hero__desc">
            FoodRescue hadir untuk membantu mengurangi pemborosan makanan di
            Indonesia. Kami menghubungkan makanan berlebih dengan mereka yang
            membutuhkan, agar tidak ada makanan yang terbuang sia-sia.
          </p>

          <div className="d-flex flex-wrap gap-2">
            <span className="about-hero__tag">
              <i className="bi bi-people-fill"></i> Alamak Agile IFA · Sore
            </span>
            <span className="about-hero__tag">
              <i className="bi bi-calendar3"></i> Didirikan 2025
            </span>
            <span className="about-hero__tag">
              <i className="bi bi-geo-alt-fill"></i> Medan, Indonesia
            </span>
          </div>
        </div>
      </section>
    );
  }
}

class AboutMission extends React.Component {
  render() {
    return (
      <section className="about-mission">
        <div className="container-md px-4 px-md-5">
          <div className="row g-5 align-items-center">
            <div className="col-12 col-md-6">
              <div className="about-badge">
                <i className="bi bi-bullseye"></i> Misi Kami
              </div>

              <h2 className="syne-h1 about-title">
                Mengubah Cara Dunia
                <br />
                Memperlakukan Makanan
              </h2>

              <p>
                Setiap tahun, jutaan ton makanan terbuang di Indonesia,
                sementara masih banyak orang yang kesulitan mendapatkan makanan.
              </p>

              <p>
                FoodRescue hadir sebagai jembatan yang menghubungkan kelebihan
                makanan dengan mereka yang membutuhkan.
              </p>

              <p>
                Dengan teknologi sederhana, kami ingin menciptakan dampak nyata
                dan membantu lebih banyak orang.
              </p>
            </div>

            <div className="col-12 col-md-6">
              <div className="about-stat-grid">
                {missionStatsData.map((stat) => (
                  <div
                    key={stat.label}
                    className={`about-stat-card ${stat.colorClass}`}
                  >
                    <div className="about-stat-card__emoji">{stat.emoji}</div>
                    <div className="about-stat-card__number">{stat.number}</div>
                    <div className="about-stat-card__label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

class AboutValues extends React.Component {
  render() {
    return (
      <section className="about-values">
        <div className="container-md px-4 px-md-5">
          <div className="text-center mb-4">
            <div className="about-badge" style={{ margin: "0 auto 10px" }}>
              <i className="bi bi-heart-fill"></i> Nilai Kami
            </div>

            <h2 className="syne-h1 about-title">Prinsip yang Kami Pegang</h2>

            <p className="about-subtitle mx-auto">
              Empat nilai inti yang memandu setiap keputusan dan fitur dalam
              platform FoodRescue.
            </p>
          </div>

          <div className="row g-3">
            {valuesData.map((val) => (
              <div key={val.number} className="col-12 col-sm-6 col-lg-3">
                <div className="about-value-card h-100">
                  <div className="about-value-card__num">{val.number}</div>
                  <div className="about-value-card__icon">{val.emoji}</div>
                  <div className="about-value-card__title syne-h1">
                    {val.title}
                  </div>
                  <p className="about-value-card__desc">{val.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}

class AboutTeam extends React.Component {
  render() {
    return (
      <section className="about-team">
        <div className="container-md px-4 px-md-5">
          <div className="mb-4">
            <div className="about-badge">
              <i className="bi bi-people-fill"></i> Tim Kami
            </div>

            <h2 className="syne-h1 about-title">Alamak Agile IFA · Sore</h2>

            <p className="about-subtitle">
              Tim pengembang yang bersemangat menciptakan solusi teknologi untuk
              masalah sosial nyata.
            </p>
          </div>

          <div className="row g-3 justify-content-center">
            {teamData.map((member, index) => (
              <div key={index} className="col-6 col-md-3">
                <div className="about-member-card">
                  <div
                    className="about-member-card__avatar"
                    style={{ background: member.avatarBg }}
                  >
                    {member.emoji}
                  </div>

                  <div className="p-3 text-center">
                    <div className="about-member-card__name">{member.name}</div>
                    <div className="about-member-card__nim">{member.nim}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}

class AboutTimeline extends React.Component {
  render() {
    return (
      <section className="about-timeline-section">
        <div className="container-md px-4 px-md-5">
          <div className="text-center mb-2">
            <div className="about-badge" style={{ margin: "0 auto 10px" }}>
              <i className="bi bi-clock-history"></i> Perjalanan Kami
            </div>

            <h2 className="syne-h1 about-title">Dari Ide ke Dampak Nyata</h2>
          </div>

          <div className="about-timeline">
            {timelineData.map((item, index) => (
              <div key={index} className="about-timeline__item">
                <div className="about-timeline__left">
                  <div className="about-timeline__circle">{item.emoji}</div>
                  {!item.isLast && <div className="about-timeline__line"></div>}
                </div>

                <div></div>

                <div className="pt-1">
                  <div className="about-timeline__date">{item.date}</div>
                  <div className="about-timeline__title syne-h1">
                    {item.title}
                  </div>
                  <p className="about-timeline__desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}

class AboutImpact extends React.Component {
  render() {
    return (
      <section className="about-impact">
        <div className="container-md px-4 px-md-5 text-center">
          <div className="about-impact__badge">🌍 Dampak Platform</div>

          <h2 className="syne-h1 about-impact__title">Angka yang Bermakna</h2>

          <p className="about-impact__subtitle">
            Setiap angka mewakili satu langkah nyata menuju Indonesia yang lebih
            peduli terhadap pangan dan sesama.
          </p>

          <div className="row g-3 mt-3">
            {impactStatsData.map((stat) => (
              <div key={stat.label} className="col-6 col-md-4 col-lg-2">
                <div className="about-impact-card">
                  <div className="syne-h1 about-impact-card__number">
                    {stat.number}
                  </div>
                  <div className="about-impact-card__label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
}

const AboutCta = () => {
  const navigate = useNavigate();

  return (
    <section className="about-cta">
      <div className="container-md px-4 px-md-5">
        <div
          className="text-center rounded-4 p-5 mx-auto"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow)",
            maxWidth: 620,
          }}
        >
          <div className="about-badge" style={{ margin: "0 auto 14px" }}>
            <i className="bi bi-rocket-fill"></i> Bergabung Sekarang
          </div>

          <h2 className="syne-h1 about-title">
            Jadilah Bagian dari Gerakan Ini
          </h2>

          <p className="about-subtitle mx-auto mb-4">
            Yuk jadi bagian dari solusi dan bantu kurangi food waste bersama
            kami.
          </p>

          <button
            onClick={() => navigate("/register")}
            className="btn-green-gradient px-4 py-2 rounded-3 d-inline-flex align-items-center gap-2 outfit fw-bold"
          >
            <i className="bi bi-person-plus-fill"></i> Daftar Gratis
          </button>
        </div>
      </div>
    </section>
  );
};

class AboutUs extends React.Component {
  render() {
    return (
      <div className="main-bg-color">
        <AboutHero />
        <AboutMission />
        <AboutValues />
        <AboutTeam />
        <AboutTimeline />
        <AboutImpact />
        <AboutCta />
      </div>
    );
  }
}

export default AboutUs;
