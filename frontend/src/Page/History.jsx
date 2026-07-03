import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../Context/AuthContext";

function History() {
  const { user } = useAuth();
  const [provided, setProvided] = useState([]);
  const [claimed, setClaimed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (user?.role === "food_provider") {
          const res = await api.get("/donations/user/history");
          setProvided(res.data.provided || []);
        } else {
          const res = await api.get("/claims/my");
          setClaimed(res.data || []);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const statusConfig = {
    available: {
      label: "Tersedia",
      color: "var(--g2)",
      bg: "rgba(95,139,76,0.12)",
      border: "rgba(95,139,76,0.3)",
    },
    partially_claimed: {
      label: "Sebagian Diklaim",
      color: "#4eb8d4",
      bg: "rgba(78,184,212,0.1)",
      border: "rgba(78,184,212,0.3)",
    },
    fully_claimed: {
      label: "Habis Diklaim",
      color: "#e8b84b",
      bg: "rgba(232,184,75,0.12)",
      border: "rgba(232,184,75,0.3)",
    },
    completed: {
      label: "Selesai",
      color: "var(--txt4)",
      bg: "rgba(0,0,0,0.06)",
      border: "var(--border)",
    },
    expired: {
      label: "Kadaluarsa",
      color: "#e05050",
      bg: "rgba(224,80,80,0.1)",
      border: "rgba(224,80,80,0.3)",
    },
    cancelled: {
      label: "Dibatalkan",
      color: "var(--txt4)",
      bg: "rgba(0,0,0,0.06)",
      border: "var(--border)",
    },
    pending: {
      label: "Menunggu",
      color: "#e8b84b",
      bg: "rgba(232,184,75,0.12)",
      border: "rgba(232,184,75,0.3)",
    },
    confirmed: {
      label: "Dikonfirmasi",
      color: "#4eb8d4",
      bg: "rgba(78,184,212,0.1)",
      border: "rgba(78,184,212,0.3)",
    },
    picked_up: {
      label: "Sudah Diambil",
      color: "var(--g2)",
      bg: "rgba(95,139,76,0.12)",
      border: "rgba(95,139,76,0.3)",
    },
    no_show: {
      label: "Tidak Hadir",
      color: "#e05050",
      bg: "rgba(224,80,80,0.1)",
      border: "rgba(224,80,80,0.3)",
    },
  };

  const getStatusBadge = (status) => {
    const s = statusConfig[status] || {
      label: status,
      color: "var(--txt4)",
      bg: "rgba(0,0,0,0.06)",
      border: "var(--border)",
    };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.border}`,
          borderRadius: 20,
          fontSize: 10,
          fontWeight: 700,
          padding: "3px 10px",
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          whiteSpace: "nowrap",
          fontFamily: "inherit",
        }}
      >
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: s.color,
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        {s.label}
      </span>
    );
  };

  const isProvider = user?.role === "food_provider";
  const activeList = isProvider ? provided : claimed;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: "rgba(95,139,76,0.1)",
            border: "1px solid rgba(95,139,76,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            className="spinner-border spinner-border-sm"
            style={{ color: "var(--g2)" }}
          />
        </div>
        <p className="outfit" style={{ color: "var(--txt4)", fontSize: 13 }}>
          Memuat riwayat...
        </p>
      </div>
    );

  return (
    <div
      className="outfit"
      style={{ background: "var(--bg)", minHeight: "100vh" }}
    >
      <div
        style={{
          background: "var(--surf2)",
          borderBottom: "1px solid var(--border)",
          padding: "20px 24px 16px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="grid-detail-responsive"
          style={{ position: "absolute", inset: 0, borderRadius: 0 }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            rowGap: 12,
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i
              className="bi-clock-history"
              style={{ fontSize: 35, color: "var(--g1)", lineHeight: 1 }}
            />
            <h4
              className="syne-h1 mb-0"
              style={{ color: "var(--txt)", fontSize: 22, lineHeight: 1 }}
            >
              Riwayat {isProvider ? "Donasi" : "Klaim"}
            </h4>
          </div>
          <div
            style={{
              background: "rgba(95,139,76,0.12)",
              border: "1px solid rgba(95,139,76,0.3)",
              borderRadius: 12,
              padding: "8px 16px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--g2)",
                display: "inline-block",
              }}
            />
            <span style={{ color: "var(--g2)", fontSize: 13, fontWeight: 600 }}>
              {activeList.length} item
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        {isProvider &&
          (provided.length === 0 ? (
            <EmptyState
              icon="bi-basket2"
              title="Belum ada donasi"
              sub="Mulai berbagi makanan ke orang yang membutuhkan"
            >
              <Link
                to="/donations/create"
                className="btn-green-gradient outfit"
                style={{
                  textDecoration: "none",
                  borderRadius: 10,
                  padding: "9px 24px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Buat Donasi →
              </Link>
            </EmptyState>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {provided.map((d) => (
                <DonationCard
                  key={d._id}
                  item={d}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          ))}
        {!isProvider &&
          (claimed.length === 0 ? (
            <EmptyState
              icon="bi-inbox"
              title="Belum ada riwayat klaim"
              sub="Temukan donasi makanan di sekitarmu"
            >
              <Link
                to="/donations"
                className="btn-green-gradient outfit"
                style={{
                  textDecoration: "none",
                  borderRadius: 10,
                  padding: "9px 24px",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Cari Donasi →
              </Link>
            </EmptyState>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 14,
              }}
            >
              {claimed.map((c) => (
                <ClaimCard
                  key={c._id}
                  item={c}
                  formatDate={formatDate}
                  getStatusBadge={getStatusBadge}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
function EmptyState({ icon, title, sub, children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        textAlign: "center",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        boxShadow: "var(--shadow)",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          marginBottom: 20,
          background: "rgba(95,139,76,0.08)",
          border: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <i
          className={`bi ${icon}`}
          style={{ fontSize: 30, color: "var(--txt4)" }}
        />
      </div>
      <p
        className="syne-h1"
        style={{ fontSize: 17, color: "var(--txt)", marginBottom: 6 }}
      >
        {title}
      </p>
      <p
        className="outfit"
        style={{ fontSize: 13, color: "var(--txt4)", marginBottom: 24 }}
      >
        {sub}
      </p>
      {children}
    </div>
  );
}

function ClaimCard({ item: c, formatDate, getStatusBadge }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hovered ? "var(--g3)" : "var(--border)"}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered ? "var(--shadow2)" : "var(--shadow)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg, var(--g1), var(--g2))",
        }}
      />
      <div style={{ padding: "16px 16px 14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
            gap: 8,
          }}
        >
          <h6
            className="syne-h1"
            style={{
              fontSize: 13,
              color: "var(--txt)",
              lineHeight: 1.3,
              margin: 0,
              flex: 1,
            }}
          >
            {c.donation_id?.category_id?.icon_emoji} {c.donation_id?.title}
          </h6>
          {getStatusBadge(c.status)}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 14,
          }}
        >
          <InfoRow
            icon="bi-box"
            text={`${c.quantity_claimed} ${c.donation_id?.quantity_unit}`}
          />
          <InfoRow icon="bi-geo-alt" text={c.donation_id?.pickup_city} />
          <InfoRow icon="bi-calendar3" text={formatDate(c.created_at)} />
        </div>

        {c.tracking_log?.length > 0 && (
          <div
            style={{
              background: "var(--g5)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 14,
            }}
          >
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--txt3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              📋 Tracking
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {c.tracking_log.map((log, i) => (
                <div
                  key={i}
                  style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "var(--g2)",
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--txt3)",
                      lineHeight: 1.5,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: "var(--txt2)" }}>
                      {log.new_status}
                    </span>
                    {log.note && ` — ${log.note}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {c.donation_id?._id && (
          <Link
            to={`/donations/${c.donation_id._id}`}
            className="btn-outline-green outfit"
            style={{
              display: "block",
              textAlign: "center",
              textDecoration: "none",
              borderRadius: 10,
              padding: "7px 0",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Lihat Donasi
          </Link>
        )}
      </div>
    </div>
  );
}

function DonationCard({ item: d, formatDate, getStatusBadge }) {
  const [hovered, setHovered] = useState(false);
  const pct =
    d.quantity > 0 ? Math.round((d.quantity_remaining / d.quantity) * 100) : 0;
  const barColor = pct > 50 ? "var(--g2)" : pct > 20 ? "#e8b84b" : "#e05050";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "var(--surface)",
        border: `1px solid ${hovered ? "var(--g3)" : "var(--border)"}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hovered ? "var(--shadow2)" : "var(--shadow)",
        transition: "border-color 0.2s, box-shadow 0.2s",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: 3,
          background: "linear-gradient(90deg, var(--g1), var(--g2))",
        }}
      />
      <div style={{ padding: "16px 16px 14px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
            gap: 8,
          }}
        >
          <h6
            className="syne-h1"
            style={{
              fontSize: 13,
              color: "var(--txt)",
              lineHeight: 1.3,
              margin: 0,
              flex: 1,
            }}
          >
            {d.category_id?.icon_emoji} {d.title}
          </h6>
          {getStatusBadge(d.status)}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            marginBottom: 12,
          }}
        >
          <InfoRow icon="bi-geo-alt" text={d.pickup_city} />
          <InfoRow icon="bi-calendar3" text={formatDate(d.created_at)} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 5,
            }}
          >
            <span style={{ fontSize: 11, color: "var(--txt4)" }}>
              Stok tersisa
            </span>
            <span style={{ fontSize: 11, fontWeight: 700, color: barColor }}>
              {d.quantity_remaining}/{d.quantity} {d.quantity_unit}
            </span>
          </div>
          <div
            style={{
              height: 5,
              background: "var(--g5)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                borderRadius: 10,
                width: `${pct}%`,
                background: barColor,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        <Link
          to={`/donations/${d._id}`}
          className="btn-outline-green outfit"
          style={{
            display: "block",
            textAlign: "center",
            textDecoration: "none",
            borderRadius: 10,
            padding: "7px 0",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ icon, text }) {
  if (!text) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
      <i
        className={`bi ${icon}`}
        style={{ color: "var(--txt4)", fontSize: 11, width: 13, flexShrink: 0 }}
      />
      <span style={{ fontSize: 12, color: "var(--txt3)" }}>{text}</span>
    </div>
  );
}

export default History;
