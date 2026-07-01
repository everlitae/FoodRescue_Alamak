import React from "react";
import { Link } from "react-router-dom";
import FeatureListCard from "../Component/FeatureListCard";
import ExampleFoodCard from "../Component/ExampleFoodCard";

class LandingPage extends React.Component {
  constructor(props) {
    super(props);
    this.featuresData = [
      {
        number: "01",
        icon: "👤",
        title: "Manajemen Pengguna",
        description:
          "Sistem akun lengkap dengan peran berbeda sesuai kebutuhan pengguna.",
        features: [
          "Registrasi & login/logout",
          "Profil yang dapat diedit",
          "Donor & Receiver",
          "Rating kepercayaan",
        ],
      },
      {
        number: "02",
        icon: "🍱",
        title: "Donasi Makanan",
        description:
          "Buat postingan donasi dengan detail lengkap dan foto makanan.",
        features: [
          "Upload foto makanan",
          "Kategori & jumlah makanan",
          "Batas waktu (deadline)",
          "Lokasi pengambilan",
        ],
      },
      {
        number: "03",
        icon: "🔄",
        title: "Interaksi & Transaksi",
        description:
          "Klaim donasi, pantau status, dan komunikasi antar pengguna.",
        features: [
          "Klaim donasi makanan",
          "Status: Available / Claimed / Completed",
          "Chat donor & penerima",
          "Pencarian & filter",
        ],
      },
      {
        number: "04",
        icon: "📊",
        title: "Riwayat & Tracking",
        description:
          "Pantau semua aktivitas donasi secara transparan dan akurat.",
        features: [
          "Riwayat donasi diberikan/diterima",
          "Tracking donasi diklaim",
          "Laporan kadaluarsa",
          "Sistem rating pengguna",
        ],
      },
      {
        number: "05",
        icon: "🛠️",
        title: "Admin Panel",
        description: "Dashboard pengelolaan platform dengan statistik lengkap.",
        features: [
          "Login admin terpisah",
          "Manajemen pengguna & postingan",
          "Statistik real-time",
          "Monitoring aktivitas",
        ],
      },
    ];
  }

  render() {
    return (
      <>
        <div className="main-bg-color min-vh-100 h-100 position-relative grid-detail-responsive">
          <div className="position-relative py-5 lp-container-pad">
            <div className="col-12 col-md-8 pe-0 pe-md-0">
              <h1 className="syne-h1 text-green1 mb-2 lp-hero-title">
                Selamatkan
                <br />
                Makanan,
                <br /> Nyalakan Harapan
              </h1>

              <p className="outfit text-green3 mt-4 lp-hero-desc">
                Platform digital yang mengurangi pemborosan makanan (food waste)
                dengan menghubungkan donatur dan penerima - lebih cepat,
                terorganisir dan berdampak.
              </p>
              <Link
                to="/login"
                className="btn-green-gradient lp-cta-btn d-inline-flex flex-row gap-2 py-3 px-5 rounded-3 fw-bold my-4"
                style={{ textDecoration: "none" }}
              >
                <i className="bi bi-gift-fill"></i>Donasikan Sekarang
              </Link>

              <div
                className="rounded-4 px-4 px-md-5 py-3 d-flex flex-wrap gap-4 gap-md-5 lp-stats"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="d-flex flex-column align-items-start justify-content-center text-green3">
                  <h3 className="syne-h1">2.4K+</h3>
                  <p className="office fw-lighter">
                    <small>DONASI AKTIF</small>
                  </p>
                </div>

                <span
                  className="lp-stats-divider"
                  style={{ border: "1px solid var(--g5)" }}
                ></span>
                <div className="d-flex flex-column align-items-start justify-content-center text-green3">
                  <h3 className="syne-h1">800+</h3>
                  <p className="office fw-lighter">
                    <small>RELAWAN</small>
                  </p>
                </div>

                <span
                  className="lp-stats-divider"
                  style={{ border: "1px solid var(--g5)" }}
                ></span>

                <div className="d-flex flex-column align-items-start justify-content-center text-green3">
                  <h3 className="syne-h1">42</h3>
                  <p className="office fw-lighter">
                    <small>KOTA</small>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="position-relative py-5"
            style={{ backgroundColor: "var(--surf2)" }}
          >
            <div className="lp-container-pad">
              <h1 className="syne-h1 my-3 text-green1 lp-section-title lp-feature-heading">
                Semua yang kamu butuhkan{" "}
                <span className="text-green4">dalam satu platform</span>
              </h1>
              <p className="outfit text-green3 mb-5 lp-feature-desc">
                Dari manajemen akun hingga chat - dirancang lengkap untuk
                kebutuhan ekosistem donasi makan yang efisien
              </p>

              <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center lp-feature-grid">
                {this.featuresData.map((card, index) => (
                  <FeatureListCard
                    key={index}
                    index={card.number}
                    emoticon={card.icon}
                    title={card.title}
                    description={card.description}
                    listFeature={card.features}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="position-relative py-5 lp-container-pad">
            <p
              className="outfit text-green3 fw-bold"
              style={{ fontSize: "smaller" }}
            >
              DONASI AKTIF
            </p>
            <h1 className="syne-h1 text-green1">
              Klaim atau buat <span className="text-green4">donasi anda</span>
            </h1>
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mt-3">
              <ExampleFoodCard foodname="Nasi & Lauk Pauk" />
              <ExampleFoodCard foodname="Roti Gandum" />
              <ExampleFoodCard foodname="Sayuran Mix" />
              <ExampleFoodCard foodname="Mie dan Bakso" />
            </div>
          </div>

          <div className="left-signin">
            <div className="position-relative py-5 lp-container-pad d-flex flex-column flex-lg-row gap-5">
              <div className="flex-fill">
                <p
                  className="outfit text-green3 fw-bold"
                  style={{ fontSize: "smaller" }}
                >
                  DAMPAK NYATA
                </p>

                <h1 className="syne-h1 text-white col-12 col-md-8">
                  Setiap gram punya arti
                </h1>

                <p className="text-light mb-3 col-12 col-md-8">
                  Bersama komunitas FoodRescue, kita membangun ekosistem berbagi
                  yang berkelanjutan
                </p>
                <Link
                  to="/login"
                  className="btn-white py-2 px-4 fw-bold rounded-3 d-inline-block"
                  style={{ textDecoration: "none" }}
                >
                  Bergabung sekarang
                </Link>
              </div>
              <div className="flex-fill d-flex justify-content-center align-items-center px-lg-5">
                <div className="row row-cols-2 g-3">
                  <div className="col">
                    <div className="card-transparent d-flex flex-column justify-content-center align-items-start p-3 rounded-4 text-white">
                      <h1 className="syne-h1">12.4T</h1>
                      <p className="outfit" style={{ fontSize: "small" }}>
                        kg makanan terselamatkan
                      </p>
                    </div>
                  </div>

                  <div className="col">
                    <div className="card-transparent d-flex flex-column justify-content-center align-items-start p-3 rounded-4 text-white">
                      <h1 className="syne-h1">42</h1>
                      <p className="outfit" style={{ fontSize: "small" }}>
                        Kota yang terjangkau
                      </p>
                    </div>
                  </div>

                  <div className="col">
                    <div className="card-transparent d-flex flex-column justify-content-center align-items-start p-3 rounded-4 text-white">
                      <h1 className="syne-h1">800+</h1>
                      <p className="outfit" style={{ fontSize: "small" }}>
                        Donatur aktif
                      </p>
                    </div>
                  </div>

                  <div className="col">
                    <div className="card-transparent d-flex flex-column justify-content-center align-items-start p-3 rounded-4 text-white">
                      <h1 className="syne-h1">8K+</h1>
                      <p className="outfit" style={{ fontSize: "small" }}>
                        Penerima manfaat
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="position-relative py-5"
            style={{ backgroundColor: "var(--surf2)" }}
          >
            <div className="lp-container-pad text-center">
              <p className="outfit fw-semibold text-green3">PERAN PENGGUNA</p>
              <h1 className="syne-h1 col-12 my-3 text-green1">
                Pilih peranmu,
                <br />
                <span className="text-green4">buat perbedaan</span>
              </h1>
              <p className="outfit text-green3 col-12 mb-5 px-2 px-md-5">
                Donoatur atau Penerima - setiap peran mempunyai dampak nyata
                dalam ekosistem FoodRescue
              </p>

              <div className="d-flex flex-column flex-lg-row gap-4 align-items-stretch justify-content-center lp-roles">
                <div className="card-green p-4 p-md-5 rounded-4 text-start flex-fill">
                  <span
                    className="p-1 fs-1 rounded-3"
                    style={{
                      backgroundColor: "var(--surf2)",
                      border: "2px solid var(--border)",
                    }}
                  >
                    🍚
                  </span>
                  <h3 className="syne-h1 text-green2 mt-3">Donatur</h3>

                  <p className="outfit text-green2 fw-light my-2">
                    Miliki makanan berlebih? Donasikan kepada mereka yang
                    membutuhkan dengan mudah dan cepat.
                  </p>

                  <p className="d-flex flex-row gap-2 text-green3">
                    <i className="bi bi-check-circle-fill"></i>
                    Buat postingan donasi
                  </p>
                  <p className="d-flex flex-row gap-2 text-green3">
                    <i className="bi bi-check-circle-fill"></i>
                    Upload foto makanan
                  </p>
                  <p className="d-flex flex-row gap-2 text-green3">
                    <i className="bi bi-check-circle-fill"></i>
                    Pantau status donasi
                  </p>
                  <p className="d-flex flex-row gap-2 text-green3">
                    <i className="bi bi-check-circle-fill"></i>
                    Riwayat donasi lengkap
                  </p>
                </div>

                <div className="card-cream p-4 p-md-5 rounded-4 text-start flex-fill">
                  <span
                    className="p-1 fs-1 rounded-3"
                    style={{
                      backgroundColor: "var(--cr4)",
                      border: "2px solid var(--cr3)",
                    }}
                  >
                    🙏
                  </span>
                  <h3 className="syne-h1 text-cream1 mt-3">Penerima</h3>

                  <p className="outfit text-cream2 fw-light my-2">
                    Butuh bantuan makanan? Temukan donasi terdekat dan klaim
                    dengan mudah tanpa syarat berbelit.
                  </p>

                  <p className="d-flex flex-row gap-2 text-cream1">
                    <i className="bi bi-check-circle-fill"></i>
                    Cari & filter donasi
                  </p>
                  <p className="d-flex flex-row gap-2 text-cream1">
                    <i className="bi bi-check-circle-fill"></i>
                    Klaim donasi langsung
                  </p>
                  <p className="d-flex flex-row gap-2 text-cream1">
                    <i className="bi bi-check-circle-fill"></i>
                    Chat dengan donor
                  </p>
                  <p className="d-flex flex-row gap-2 text-cream1">
                    <i className="bi bi-check-circle-fill"></i>
                    Riwayat penerimaan
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="position-relative d-flex flex-row align-items-center justify-content-center p-3 p-md-5"
            style={{ backgroundColor: "var(--cr4)" }}
          >
            <div
              className="position-relative rounded-5 p-4 p-md-5 text-center"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
                maxWidth: "900px",
              }}
            >
              <p className="outfit fw-semibold text-green3">
                BERGABUNG SEKARANG
              </p>
              <h1 className="syne-h1 col-12 my-3 text-green1 lp-section-title">
                Bersama kita kurangi{" "}
                <span className="text-green4">foodwaste</span> di Indonesia
              </h1>
              <p className="outfit text-green3 col-12 mb-5 px-1 px-md-5">
                Donoatur atau Penerima - setiap peran mempunyai dampak
              </p>
              <Link
                to="/login"
                className="btn-green-gradient lp-cta-btn px-5 py-4 rounded-4 outfit fw-bold d-inline-block"
                style={{ textDecoration: "none" }}
              >
                Bergabung Sekarang
              </Link>

              <p className="text-green3 mt-3" style={{ fontSize: "small" }}>
                Dikembangkan oleh <b>Alamak IF-A Sore</b>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default LandingPage;
