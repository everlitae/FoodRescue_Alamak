import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../Context/AuthContext";

const STATUS_CONFIG = {
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
};

const CLAIM_CONFIG = {
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
  completed: {
    label: "Selesai",
    color: "var(--g2)",
    bg: "rgba(95,139,76,0.12)",
    border: "rgba(95,139,76,0.3)",
  },
  cancelled: {
    label: "Dibatalkan",
    color: "#e05050",
    bg: "rgba(224,80,80,0.1)",
    border: "rgba(224,80,80,0.3)",
  },
  no_show: {
    label: "Tidak Hadir",
    color: "#e05050",
    bg: "rgba(224,80,80,0.1)",
    border: "rgba(224,80,80,0.3)",
  },
};

// ── Sub-components (class inheritance tidak berlaku di sini,
//    tapi komponen ini menggunakan komposisi sesuai prinsip React) ──

class BaseCard {
  static defaultStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: "18px 20px",
    boxShadow: "var(--shadow)",
  };
}

function StatusBadge({ status, config }) {
  const s = config[status] || {
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
        fontSize: 11,
        fontWeight: 700,
        padding: "4px 12px",
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: s.color,
          display: "inline-block",
        }}
      />
      {s.label}
    </span>
  );
}

function Card({ children, style = {} }) {
  return <div style={{ ...BaseCard.defaultStyle, ...style }}>{children}</div>;
}

function CardTitle({ icon, title }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: "rgba(95,139,76,0.12)",
          border: "1px solid rgba(95,139,76,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <i
          className={`bi ${icon}`}
          style={{ color: "var(--g2)", fontSize: 14 }}
        />
      </div>
      <span className="syne-h1" style={{ fontSize: 13, color: "var(--txt)" }}>
        {title}
      </span>
    </div>
  );
}

function InfoRow({ icon, label, value, accent }) {
  if (!value) return null;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <i
        className={`bi ${icon}`}
        style={{
          color: "var(--txt4)",
          fontSize: 13,
          marginTop: 1,
          flexShrink: 0,
          width: 16,
        }}
      />
      <div style={{ flex: 1 }}>
        <span
          style={{
            fontSize: 11,
            color: "var(--txt4)",
            display: "block",
            marginBottom: 1,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: 13,
            color: accent || "var(--txt2)",
            fontWeight: 500,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function ActionBtn({ children, onClick, disabled, color, outline }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: outline ? "none" : 1,
        padding: outline ? "6px 12px" : "6px 10px",
        borderRadius: 8,
        border: `1px solid ${color}`,
        background: outline ? "transparent" : color,
        color: outline ? color : "#fff",
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        opacity: disabled ? 0.6 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid var(--border)",
  padding: "9px 12px",
  fontSize: 13,
  fontFamily: "inherit",
  background: "var(--g5)",
  outline: "none",
  boxSizing: "border-box",
  color: "var(--txt)",
};

function DonationDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  const [donation, setDonation] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [claimForm, setClaimForm] = useState({
    quantity_claimed: 1,
    pickup_scheduled_at: "",
    notes: "",
  });
  const [conversation, setConversation] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const [rating, setRating] = useState(0);
  const [ratingReview, setRatingReview] = useState("");
  const [hasRated, setHasRated] = useState(false);
  const [ratingMsg, setRatingMsg] = useState("");
  const [userClaim, setUserClaim] = useState(null);

  const userId = user?.id || user?._id;
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const formatDateTime = (d) => new Date(d).toLocaleString("id-ID");
  const formatTime = (d) =>
    new Date(d).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const fetchDonation = async () => {
    try {
      const res = await api.get(`/donations/${id}`);
      setDonation(res.data);
    } catch {
      navigate("/donations");
    } finally {
      setLoading(false);
    }
  };

  const fetchClaims = async () => {
    if (!user) return;
    try {
      const res = await api.get(`/claims/donation/${id}`);
      setClaims(res.data);
    } catch {}
  };

  const fetchMyClaim = async () => {
    if (!user) return;
    try {
      const res = await api.get("/claims/my");
      const found = res.data.find((c) => c.donation_id?._id === id);
      setUserClaim(found || null);
      if (found?.status === "completed") {
        const r = await api.get(`/ratings/check/${found._id}`);
        setHasRated(r.data.hasRated);
      }
    } catch {}
  };

  const fetchConversation = async () => {
    if (!user || !donation) return;
    try {
      const res = await api.get("/conversations");
      const found = res.data.find((c) => c.donation_id?._id === id);
      if (found) setConversation(found);
    } catch {}
  };

  useEffect(() => {
    fetchDonation();
  }, [id]);
  useEffect(() => {
    if (donation) {
      fetchMyClaim();
      fetchClaims();
      fetchConversation();
    }
  }, [donation]);
  useEffect(() => {
    if (chatContainerRef.current)
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
  }, [conversation?.messages?.length]);

  const handleClaim = async () => {
    if (!user) return navigate("/login");
    setActionLoading(true);
    try {
      await api.post("/claims", { donation_id: id, ...claimForm });
      setMsg("success:Donasi berhasil diklaim!");
      fetchDonation();
      fetchMyClaim();
    } catch (err) {
      setMsg("error:" + (err.response?.data?.msg || "Gagal klaim"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaimAction = async (claimId, action) => {
    setActionLoading(true);
    try {
      await api.put(`/claims/${claimId}/${action}`);
      setMsg(`success:Klaim berhasil di-${action}!`);
      fetchClaims();
      fetchDonation();
    } catch (err) {
      setMsg("error:" + (err.response?.data?.msg || "Gagal"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!user) return navigate("/login");
    try {
      const receiverId = isOwner
        ? userClaim?.seeker_id
        : donation.provider_id._id;
      const res = await api.post("/conversations", {
        donation_id: id,
        receiver_id: receiverId,
      });
      setConversation(res.data);
    } catch {}
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || !conversation) return;
    try {
      await api.post(`/conversations/${conversation._id}/messages`, {
        content: chatMsg,
      });
      setChatMsg("");
      const res = await api.get(`/conversations/${conversation._id}`);
      setConversation(res.data);
    } catch {}
  };

  const handleRating = async () => {
    if (rating === 0) return setRatingMsg("error:Pilih bintang dulu!");
    try {
      await api.post("/ratings", {
        claim_id: userClaim._id,
        score: rating,
        review: ratingReview,
      });
      setHasRated(true);
      setRatingMsg("success:Rating berhasil dikirim!");
    } catch (err) {
      setRatingMsg(
        "error:" + (err.response?.data?.msg || "Gagal kirim rating"),
      );
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Hapus donasi ini?")) return;
    try {
      await api.delete(`/donations/${id}`);
      navigate("/donations");
    } catch (err) {
      setMsg("error:" + (err.response?.data?.msg || "Gagal hapus donasi"));
    }
  };

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
          Memuat detail donasi...
        </p>
      </div>
    );

  if (!donation) return null;

  const isOwner = userId === donation.provider_id?._id;
  const isProviderRole = user?.role === "food_provider";
  const isOtherProvider = isProviderRole && !isOwner;

  const canClaim =
    user &&
    !isProviderRole &&
    !isOwner &&
    ["available", "partially_claimed"].includes(donation.status) &&
    !userClaim;

  const canChat =
    user &&
    (isOwner || userClaim) &&
    ["partially_claimed", "fully_claimed", "completed"].includes(
      donation.status,
    );

  const canRate =
    user && !isProviderRole && userClaim?.status === "completed" && !hasRated;

  const pct =
    donation.quantity > 0
      ? Math.round((donation.quantity_remaining / donation.quantity) * 100)
      : 0;
  const barColor = pct > 50 ? "var(--g2)" : pct > 20 ? "#e8b84b" : "#e05050";

  return (
    <div
      className="outfit"
      style={{ background: "var(--bg)", minHeight: "100vh" }}
    >
      <div
        style={{
          background: "var(--surf2)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
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
            alignItems: "center",
            gap: 14,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--txt3)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <i className="bi bi-arrow-left" style={{ fontSize: 16 }} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              className="syne-h1 mb-0"
              style={{
                color: "var(--txt)",
                fontSize: 18,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {donation.title}
            </h4>
          </div>
          <StatusBadge status={donation.status} config={STATUS_CONFIG} />
        </div>
      </div>

      {msg && (
        <div style={{ padding: "12px 24px 0" }}>
          <div
            style={{
              borderRadius: 12,
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: msg.startsWith("success")
                ? "rgba(95,139,76,0.12)"
                : "rgba(224,80,80,0.1)",
              border: `1px solid ${msg.startsWith("success") ? "rgba(95,139,76,0.3)" : "rgba(224,80,80,0.3)"}`,
              color: msg.startsWith("success") ? "var(--g2)" : "#e05050",
            }}
          >
            <i
              className={`bi ${msg.startsWith("success") ? "bi-check-circle-fill" : "bi-exclamation-circle-fill"}`}
            />
            {msg.replace(/^(success|error):/, "")}
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "20px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 20,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            {donation.photos?.length > 0 ? (
              <div>
                <div style={{ position: "relative" }}>
                  <img
                    src={donation.photos[activePhoto].photo_url}
                    alt={donation.title}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: 320,
                      objectFit: "contain",
                      display: "block",
                      background: "var(--surf2)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 80,
                      background:
                        "linear-gradient(transparent, rgba(0,0,0,0.4))",
                    }}
                  />
                  {donation.photos.length > 1 && (
                    <>
                      <button
                        onClick={() =>
                          setActivePhoto(
                            (p) =>
                              (p - 1 + donation.photos.length) %
                              donation.photos.length,
                          )
                        }
                        style={{
                          position: "absolute",
                          left: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: "none",
                          background: "rgba(0,0,0,0.4)",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <i
                          className="bi bi-chevron-left"
                          style={{ fontSize: 16 }}
                        />
                      </button>
                      <button
                        onClick={() =>
                          setActivePhoto(
                            (p) => (p + 1) % donation.photos.length,
                          )
                        }
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: "none",
                          background: "rgba(0,0,0,0.4)",
                          color: "#fff",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backdropFilter: "blur(4px)",
                        }}
                      >
                        <i
                          className="bi bi-chevron-right"
                          style={{ fontSize: 16 }}
                        />
                      </button>
                      <div
                        style={{
                          position: "absolute",
                          bottom: 12,
                          left: "50%",
                          transform: "translateX(-50%)",
                          display: "flex",
                          gap: 6,
                        }}
                      >
                        {donation.photos.map((_, i) => (
                          <div
                            key={i}
                            onClick={() => setActivePhoto(i)}
                            style={{
                              width: i === activePhoto ? 20 : 6,
                              height: 6,
                              borderRadius: 3,
                              background:
                                i === activePhoto
                                  ? "#fff"
                                  : "rgba(255,255,255,0.5)",
                              cursor: "pointer",
                              transition: "all 0.2s",
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                {donation.photos.length > 1 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      padding: "12px 16px",
                      overflowX: "auto",
                    }}
                  >
                    {donation.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p.photo_url}
                        alt=""
                        onClick={() => setActivePhoto(i)}
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          objectPosition: "center",
                          borderRadius: 8,
                          cursor: "pointer",
                          flexShrink: 0,
                          border:
                            i === activePhoto
                              ? "2px solid var(--g2)"
                              : "2px solid transparent",
                          opacity: i === activePhoto ? 1 : 0.6,
                          transition: "all 0.2s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div
                style={{
                  height: 280,
                  background: "var(--surf2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <i
                  className="bi bi-image"
                  style={{ fontSize: 48, color: "var(--txt4)" }}
                />
              </div>
            )}
          </Card>

          <Card>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div>
                <h2
                  className="syne-h1"
                  style={{
                    fontSize: 22,
                    color: "var(--txt)",
                    marginBottom: 8,
                    lineHeight: 1.2,
                  }}
                >
                  {donation.title}
                </h2>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <StatusBadge
                    status={donation.status}
                    config={STATUS_CONFIG}
                  />
                  {donation.category_id && (
                    <span
                      style={{
                        background: "var(--g5)",
                        color: "var(--txt3)",
                        border: "1px solid var(--border)",
                        borderRadius: 20,
                        fontSize: 11,
                        padding: "4px 12px",
                        fontWeight: 600,
                      }}
                    >
                      {donation.category_id.icon_emoji}{" "}
                      {donation.category_id.name}
                    </span>
                  )}
                  {donation.is_halal && (
                    <span
                      style={{
                        background: "rgba(95,139,76,0.1)",
                        color: "var(--g2)",
                        border: "1px solid rgba(95,139,76,0.25)",
                        borderRadius: 20,
                        fontSize: 11,
                        padding: "4px 12px",
                        fontWeight: 600,
                      }}
                    >
                      ✅ Halal
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                background: "var(--g5)",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 14,
                border: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 12, color: "var(--txt4)" }}>
                  Stok tersisa
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: barColor }}
                >
                  {donation.quantity_remaining}/{donation.quantity}{" "}
                  {donation.quantity_unit}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: "var(--border)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: barColor,
                    borderRadius: 10,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>

            {donation.description && (
              <p
                style={{ fontSize: 14, color: "var(--txt3)", lineHeight: 1.8 }}
              >
                {donation.description}
              </p>
            )}
          </Card>
          <Card>
            <CardTitle icon="bi-info-circle" title="Informasi Donasi" />
            <InfoRow
              icon="bi-geo-alt"
              label="Lokasi Pickup"
              value={`${donation.pickup_address}, ${donation.pickup_city}`}
            />
            <InfoRow
              icon="bi-clock"
              label="Batas Waktu"
              value={formatDate(donation.expired_at)}
              accent="#e05050"
            />
            {donation.pickup_start_time && (
              <InfoRow
                icon="bi-alarm"
                label="Jam Pickup"
                value={`${donation.pickup_start_time} – ${donation.pickup_end_time}`}
              />
            )}
            {donation.pickup_notes && (
              <InfoRow
                icon="bi-sticky"
                label="Catatan Pickup"
                value={donation.pickup_notes}
              />
            )}
            {donation.allergen_notes && (
              <InfoRow
                icon="bi-exclamation-triangle"
                label="Alergen"
                value={donation.allergen_notes}
                accent="#e8b84b"
              />
            )}
            <InfoRow
              icon="bi-calendar3"
              label="Dibuat"
              value={formatDate(donation.created_at)}
            />
          </Card>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <CardTitle icon="bi-person-circle" title="Info Provider" />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "var(--g1)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {donation.provider_id?.first_name?.[0] || "?"}
              </div>
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 14,
                    color: "var(--txt)",
                  }}
                >
                  {donation.provider_id?.first_name}{" "}
                  {donation.provider_id?.last_name}
                </p>
                {donation.provider_id?.city && (
                  <p style={{ margin: 0, fontSize: 12, color: "var(--txt4)" }}>
                    <i className="bi bi-geo me-1" />
                    {donation.provider_id.city}
                  </p>
                )}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                background: "var(--g5)",
                borderRadius: 10,
                border: "1px solid var(--border)",
              }}
            >
              <div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    color: "var(--txt4)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Trust Score
                </p>
                <div style={{ display: "flex", gap: 2, marginTop: 3 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      style={{
                        fontSize: 14,
                        color:
                          s <=
                          Math.round(donation.provider_id?.trust_score || 5)
                            ? "#e8b84b"
                            : "var(--txt4)",
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <span
                className="syne-h1"
                style={{ fontSize: 22, color: "#e8b84b" }}
              >
                {donation.provider_id?.trust_score?.toFixed(1) || "5.0"}
              </span>
            </div>
          </Card>

          {isOtherProvider && (
            <Card>
              <div
                style={{ display: "flex", alignItems: "flex-start", gap: 12 }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    flexShrink: 0,
                    background: "rgba(232,184,75,0.12)",
                    border: "1px solid rgba(232,184,75,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="bi bi-info-circle"
                    style={{ color: "#e8b84b", fontSize: 16 }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#e8b84b",
                      marginBottom: 4,
                    }}
                  >
                    Mode Lihat
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      color: "var(--txt3)",
                      lineHeight: 1.6,
                    }}
                  >
                    Kamu adalah <b>Food Provider</b>. Hanya Food Seeker yang
                    dapat mengklaim donasi ini. Kamu tetap bisa melihat detail
                    donasi sebagai referensi.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {userClaim && (
            <Card>
              <CardTitle icon="bi-receipt" title="Status Klaim Kamu" />
              <div style={{ marginBottom: 10 }}>
                <StatusBadge status={userClaim.status} config={CLAIM_CONFIG} />
              </div>
              <p
                style={{ fontSize: 12, color: "var(--txt4)", marginBottom: 8 }}
              >
                {userClaim.quantity_claimed} {donation.quantity_unit} · Diklaim{" "}
                {formatDateTime(userClaim.created_at)}
              </p>
              {userClaim.pickup_scheduled_at && (
                <div
                  style={{
                    background: "var(--g5)",
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 10,
                    border: "1px solid var(--border)",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 12, color: "var(--txt3)" }}>
                    <i className="bi bi-calendar3 me-1" />
                    Jadwal: {formatDateTime(userClaim.pickup_scheduled_at)}
                  </p>
                </div>
              )}
              {["pending", "confirmed"].includes(userClaim.status) && (
                <button
                  onClick={() => handleClaimAction(userClaim._id, "cancel")}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: 10,
                    border: "1px solid rgba(224,80,80,0.3)",
                    background: "rgba(224,80,80,0.08)",
                    color: "#e05050",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                  }}
                >
                  <i className="bi bi-x-circle me-1" />
                  Batalkan Klaim
                </button>
              )}
            </Card>
          )}

          {canClaim && (
            <Card>
              <CardTitle icon="bi-hand-index" title="Klaim Donasi" />
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "var(--txt4)",
                    marginBottom: 5,
                    display: "block",
                    fontWeight: 600,
                  }}
                >
                  Jumlah ({donation.quantity_unit})
                </label>
                <input
                  type="number"
                  min={1}
                  max={Math.min(1, donation.quantity_remaining)}
                  value={claimForm.quantity_claimed}
                  onChange={(e) =>
                    setClaimForm({
                      ...claimForm,
                      quantity_claimed: Number(e.target.value),
                    })
                  }
                  style={inputStyle}
                  className="input-green"
                />
                <small
                  style={{
                    fontSize: 11,
                    color: "var(--txt4)",
                    marginTop: 4,
                    display: "block",
                  }}
                >
                  Maksimal {Math.min(1, donation.quantity_remaining)}{" "}
                  {donation.quantity_unit} per orang
                </small>
              </div>
              <div style={{ marginBottom: 10 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "var(--txt4)",
                    marginBottom: 5,
                    display: "block",
                    fontWeight: 600,
                  }}
                >
                  Jadwal Pickup (opsional)
                </label>
                <input
                  type="datetime-local"
                  value={claimForm.pickup_scheduled_at}
                  onChange={(e) =>
                    setClaimForm({
                      ...claimForm,
                      pickup_scheduled_at: e.target.value,
                    })
                  }
                  style={inputStyle}
                  className="input-green"
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    fontSize: 11,
                    color: "var(--txt4)",
                    marginBottom: 5,
                    display: "block",
                    fontWeight: 600,
                  }}
                >
                  Catatan (opsional)
                </label>
                <textarea
                  rows={2}
                  value={claimForm.notes}
                  onChange={(e) =>
                    setClaimForm({ ...claimForm, notes: e.target.value })
                  }
                  style={{ ...inputStyle, resize: "vertical" }}
                  className="input-green"
                />
              </div>
              <button
                onClick={handleClaim}
                disabled={actionLoading}
                className="btn-green-gradient"
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {actionLoading ? (
                  <div
                    className="spinner-border spinner-border-sm"
                    style={{ width: 14, height: 14, borderWidth: 2 }}
                  />
                ) : (
                  <i className="bi bi-hand-index" />
                )}
                Klaim Sekarang
              </button>
            </Card>
          )}

          {isOwner && claims.length > 0 && (
            <Card>
              <CardTitle
                icon="bi-people"
                title={`Daftar Klaim (${claims.length})`}
              />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {claims.map((c) => (
                  <div
                    key={c._id}
                    style={{
                      background: "var(--g5)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      padding: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: "50%",
                            background: "var(--g1)",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {c.seeker_id?.first_name?.[0] || "?"}
                        </div>
                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 12,
                              fontWeight: 700,
                              color: "var(--txt)",
                            }}
                          >
                            {c.seeker_id?.first_name} {c.seeker_id?.last_name}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontSize: 11,
                              color: "var(--txt4)",
                            }}
                          >
                            {c.quantity_claimed} {donation.quantity_unit}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={c.status} config={CLAIM_CONFIG} />
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {c.status === "pending" && (
                        <ActionBtn
                          onClick={() => handleClaimAction(c._id, "confirm")}
                          disabled={actionLoading}
                          color="var(--g1)"
                        >
                          ✓ Konfirmasi
                        </ActionBtn>
                      )}
                      {c.status === "confirmed" && (
                        <ActionBtn
                          onClick={() => handleClaimAction(c._id, "pickup")}
                          disabled={actionLoading}
                          color="#4eb8d4"
                        >
                          📦 Diambil
                        </ActionBtn>
                      )}
                      {c.status === "picked_up" && (
                        <ActionBtn
                          onClick={() => handleClaimAction(c._id, "complete")}
                          disabled={actionLoading}
                          color="var(--g1)"
                        >
                          ✓ Selesai
                        </ActionBtn>
                      )}
                      {["pending", "confirmed"].includes(c.status) && (
                        <ActionBtn
                          onClick={() => handleClaimAction(c._id, "cancel")}
                          disabled={actionLoading}
                          color="#e05050"
                          outline
                        >
                          ✕
                        </ActionBtn>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {canChat && (
            <Card>
              <CardTitle icon="bi-chat-dots" title="Chat" />
              {!conversation ? (
                <button
                  onClick={handleStartChat}
                  className="btn-green-gradient"
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  <i className="bi bi-chat-dots me-2" />
                  Mulai Chat
                </button>
              ) : (
                <>
                  <div
                    ref={chatContainerRef}
                    style={{
                      height: 200,
                      overflowY: "auto",
                      marginBottom: 10,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {conversation.messages?.length === 0 ? (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <p style={{ fontSize: 12, color: "var(--txt4)" }}>
                          Belum ada pesan
                        </p>
                      </div>
                    ) : (
                      conversation.messages.map((m) => {
                        const isMe =
                          m.sender_id === userId || m.sender_id?._id === userId;
                        return (
                          <div
                            key={m._id}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: isMe ? "flex-end" : "flex-start",
                            }}
                          >
                            <div
                              style={{
                                maxWidth: "80%",
                                padding: "7px 12px",
                                borderRadius: isMe
                                  ? "12px 12px 3px 12px"
                                  : "12px 12px 12px 3px",
                                background: isMe
                                  ? "var(--g1)"
                                  : "var(--surface)",
                                border: isMe
                                  ? "none"
                                  : "1px solid var(--border)",
                                color: isMe ? "#fff" : "var(--txt)",
                                fontSize: 12,
                                lineHeight: 1.5,
                                wordBreak: "break-word",
                              }}
                            >
                              {m.is_deleted_by_sender ? (
                                <em style={{ opacity: 0.6 }}>Pesan dihapus</em>
                              ) : (
                                m.content
                              )}
                            </div>
                            <small
                              style={{
                                fontSize: 10,
                                color: "var(--txt4)",
                                marginTop: 2,
                              }}
                            >
                              {formatTime(m.created_at)}
                            </small>
                          </div>
                        );
                      })
                    )}
                  </div>
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
                  >
                    <textarea
                      className="input-green"
                      placeholder="Tulis pesan..."
                      value={chatMsg}
                      rows={1}
                      onChange={(e) => setChatMsg(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      style={{
                        flex: 1,
                        resize: "none",
                        borderRadius: 10,
                        border: "1px solid var(--border)",
                        padding: "8px 12px",
                        fontSize: 12,
                        fontFamily: "inherit",
                        background: "var(--g5)",
                        outline: "none",
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatMsg.trim()}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        border: "none",
                        cursor: chatMsg.trim() ? "pointer" : "not-allowed",
                        background: chatMsg.trim() ? "var(--g1)" : "var(--g5)",
                        color: chatMsg.trim() ? "#fff" : "var(--txt4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                    >
                      <i className="bi bi-send" style={{ fontSize: 13 }} />
                    </button>
                  </div>
                </>
              )}
            </Card>
          )}

          {canRate && (
            <Card>
              <CardTitle icon="bi-star" title="Beri Rating Provider" />
              {ratingMsg && (
                <div
                  style={{
                    borderRadius: 8,
                    padding: "8px 12px",
                    marginBottom: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: ratingMsg.startsWith("success")
                      ? "rgba(95,139,76,0.12)"
                      : "rgba(224,80,80,0.1)",
                    color: ratingMsg.startsWith("success")
                      ? "var(--g2)"
                      : "#e05050",
                    border: `1px solid ${ratingMsg.startsWith("success") ? "rgba(95,139,76,0.3)" : "rgba(224,80,80,0.3)"}`,
                  }}
                >
                  {ratingMsg.replace(/^(success|error):/, "")}
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  marginBottom: 14,
                  justifyContent: "center",
                }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <span
                    key={s}
                    onClick={() => setRating(s)}
                    style={{
                      fontSize: 28,
                      cursor: "pointer",
                      transition: "transform 0.1s",
                      transform: s <= rating ? "scale(1.1)" : "scale(1)",
                      color: s <= rating ? "#e8b84b" : "var(--txt4)",
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
              <textarea
                rows={2}
                placeholder="Tulis review (opsional)..."
                value={ratingReview}
                onChange={(e) => setRatingReview(e.target.value)}
                style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
                className="input-green"
              />
              <button
                onClick={handleRating}
                className="btn-green-gradient"
                style={{
                  width: "100%",
                  border: "none",
                  borderRadius: 10,
                  padding: "9px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <i className="bi bi-send me-1" />
                Kirim Rating
              </button>
            </Card>
          )}

          {hasRated && (
            <Card>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: "rgba(95,139,76,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <i
                    className="bi bi-check-circle-fill"
                    style={{ color: "var(--g2)", fontSize: 16 }}
                  />
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: "var(--g2)",
                    fontWeight: 600,
                  }}
                >
                  Kamu sudah memberi rating
                </p>
              </div>
            </Card>
          )}

          {isOwner &&
            ["available", "expired", "cancelled"].includes(donation.status) && (
              <Card>
                <button
                  onClick={handleDelete}
                  style={{
                    width: "100%",
                    padding: "9px",
                    borderRadius: 10,
                    border: "1px solid rgba(224,80,80,0.3)",
                    background: "rgba(224,80,80,0.08)",
                    color: "#e05050",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <i className="bi bi-trash" />
                  Hapus Donasi
                </button>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}

export default DonationDetail;
