import React from "react";
import { Link } from "react-router-dom";

const footerLinks = [
  {
    heading: "Platform",
    links: [
      { label: "Donasi", to: "/donations" },
      { label: "Buat Donasi", to: "/donations/create" },
      { label: "Komunitas", to: "/community" },
      { label: "Riwayat", to: "/history" },
    ],
  },
  {
    heading: "Informasi",
    links: [
      { label: "Tentang Kami", to: "/about" },
      { label: "FAQ", to: "/faq" },
      { label: "Kontak", to: "/contact" },
      { label: "Kebijakan Privasi", to: "/privacy-policy" },
    ],
  },
  {
    heading: "Akun",
    links: [
      { label: "Sign In", to: "/login" },
      { label: "Register", to: "/register" },
      { label: "Profil", to: "/profile" },
      { label: "Pesan", to: "/messages" },
    ],
  },
];

class Footer extends React.Component {
  render() {
    return (
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          padding: "48px 40px 28px",
        }}
      >
        <div className="d-flex flex-wrap gap-5 justify-content-between align-items-start mb-5">
          {/* Brand */}
          <div style={{ maxWidth: 240 }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <img
                src="/assets/logo/foodrescue_logo_only.png"
                width={38}
                height={33}
                alt="FoodRescue Logo"
              />
              <div style={{ lineHeight: 1.2 }}>
                <p
                  className="syne-h1 text-green1"
                  style={{ fontSize: 15, margin: 0 }}
                >
                  FoodRescue
                </p>
                <p
                  className="outfit"
                  style={{
                    fontSize: 9,
                    color: "var(--txt4)",
                    margin: 0,
                    letterSpacing: "0.1em",
                  }}
                >
                  WEB PLATFORM
                </p>
              </div>
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
              Platform digital yang mengurangi food waste dan menghubungkan
              semua pihak yang peduli terhadap lingkungan.
            </p>
          </div>

          {/* Link Columns */}
          <div className="d-flex flex-wrap gap-5">
            {footerLinks.map((col) => (
              <div key={col.heading} style={{ minWidth: 120 }}>
                <p
                  className="syne-h1"
                  style={{
                    fontSize: 13,
                    color: "var(--txt2)",
                    marginBottom: 14,
                  }}
                >
                  {col.heading}
                </p>
                <div className="d-flex flex-column gap-2">
                  {col.links.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="outfit"
                      style={{
                        fontSize: 13,
                        color: "var(--txt3)",
                        textDecoration: "none",
                        transition: "color 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--g1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--txt3)")
                      }
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <p
            className="outfit"
            style={{ fontSize: 12, color: "var(--txt4)", margin: 0 }}
          >
            &copy; 2026 FoodRescue Web — Alamak IF-A Sore. All Rights Reserved.
          </p>
          <p
            className="outfit"
            style={{ fontSize: 12, color: "var(--txt4)", margin: 0 }}
          >
            Made with <span style={{ color: "var(--g1)" }}>♥</span> for a better
            world
          </p>
        </div>
      </footer>
    );
  }
}

export default Footer;
