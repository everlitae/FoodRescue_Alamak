import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../Context/AuthContext";
import { getBadge, getNextBadge } from "../utils/badgeHelper";

function Profile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
    city: "",
    bio: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const fetchProfile = () => {
    setLoading(true);
    setFetchError(null);
    api
      .get("/users/profile")
      .then((res) => {
        setProfile(res.data);
        setForm({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          username: res.data.username || "",
          phone: res.data.phone || "",
          city: res.data.city || "",
          bio: res.data.profile?.bio || "",
        });
      })
      .catch((err) => {
        console.error("Gagal ambil profile:", err);
        setFetchError(
          err.response?.data?.msg ||
            err.message ||
            "Gagal memuat profil. Coba lagi.",
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSave = async () => {
    try {
      const res = await api.put("/users/profile", form);
      setProfile(res.data);
      setEditMode(false);
      setMsg("success");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("error");
      setTimeout(() => setMsg(""), 3000);
    }
  };

  const ROLE_LABEL = {
    food_provider: { label: "Food Provider", icon: "🍱" },
    food_seeker: { label: "Food Seeker", icon: "🤲" },
    admin: { label: "Admin", icon: "⚙️" },
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div className="spinner-border" style={{ color: "var(--g1)" }} />
      </div>
    );

  if (!profile)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 20,
          textAlign: "center",
        }}
      >
        <i
          className="bi bi-exclamation-triangle"
          style={{ fontSize: 32, color: "var(--sa1)" }}
        />
        <p className="outfit text-green3" style={{ maxWidth: 360 }}>
          {fetchError || "Gagal memuat profil."}
        </p>
        <button
          className="btn-green-gradient px-4 py-2 rounded-3 fw-bold"
          style={{ border: "none" }}
          onClick={fetchProfile}
        >
          Coba Lagi
        </button>
      </div>
    );

  const role = ROLE_LABEL[profile.role] || {};
  const trustRounded = Math.round(profile.trust_score || 0);

  return (
    <div
      className="outfit"
      style={{ background: "var(--bg)", minHeight: "100vh" }}
    >
      <div
        style={{
          background:
            "linear-gradient(155deg,#2e5220 0%,var(--g1) 45%,var(--cr2) 100%)",
          padding: "28px 24px 60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="grid-detail-light"
          style={{ position: "absolute", inset: 0 }}
        />
        <div
          style={{
            position: "relative",
            zIndex: 1,
            maxWidth: 640,
            margin: "0 auto",
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
              borderRadius: 10,
              padding: "7px 14px",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <i className="bi bi-arrow-left" /> Kembali
          </button>
        </div>
      </div>

      {/* ── Card utama ── */}
      <div
        style={{
          maxWidth: 640,
          margin: "-44px auto 48px",
          padding: "0 20px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Avatar + nama */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            boxShadow: "var(--shadow2)",
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          {/* Avatar area */}
          <div
            style={{
              padding: "32px 28px 24px",
              display: "flex",
              alignItems: "flex-end",
              gap: 20,
            }}
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                background: "linear-gradient(135deg,var(--g1),var(--g2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "4px solid var(--surface)",
                boxShadow: "var(--shadow2)",
                flexShrink: 0,
              }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <i
                  className="bi bi-person-fill"
                  style={{ fontSize: 40, color: "#fff" }}
                />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingBottom: 4 }}>
              <h4
                className="syne-h1"
                style={{ fontSize: 20, color: "var(--txt)", marginBottom: 4 }}
              >
                {profile.first_name} {profile.last_name}
              </h4>
              {profile.username && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--txt3)",
                    marginBottom: 6,
                  }}
                >
                  @{profile.username}
                </p>
              )}

              {/* Badge Level (bukan buat admin, gamifikasi ini cuma relevan buat provider/seeker) */}
              {profile.role !== "admin" &&
                (() => {
                  const badge = getBadge(profile.total_points || 0);
                  const next = getNextBadge(profile.total_points || 0);
                  return (
                    <div style={{ marginBottom: 8 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "4px 12px",
                          borderRadius: 999,
                          background: badge.bgColor,
                          border: `1px solid ${badge.borderColor}`,
                          fontSize: 12,
                          fontWeight: 700,
                          color: badge.color,
                        }}
                      >
                        {badge.emoji} {badge.level}
                      </span>
                      {next && (
                        <p
                          style={{
                            fontSize: 10,
                            color: "var(--txt4)",
                            marginTop: 4,
                            marginBottom: 0,
                          }}
                        >
                          {next.needed} poin lagi untuk {next.emoji}{" "}
                          {next.level}
                        </p>
                      )}
                    </div>
                  );
                })()}

              <span
                className="badge-green"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {role.icon} {role.label}
              </span>
            </div>
          </div>

          {/* Trust score bar (bukan buat admin) */}
          {profile.role !== "admin" && (
            <div style={{ padding: "0 28px 24px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--txt4)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Trust Score
                </span>
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "var(--g1)" }}
                >
                  {profile.trust_score?.toFixed(1) || "5.0"} / 5.0
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 10,
                  background: "var(--border)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    borderRadius: 10,
                    background: "linear-gradient(90deg,var(--g1),var(--g2))",
                    width: `${((profile.trust_score || 5) / 5) * 100}%`,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <div style={{ display: "flex", gap: 2, marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <i
                    key={i}
                    className={`bi ${i <= trustRounded ? "bi-star-fill" : "bi-star"}`}
                    style={{
                      fontSize: 12,
                      color: i <= trustRounded ? "var(--g2)" : "var(--border)",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              borderTop: "1px solid var(--border)",
            }}
          >
            {(profile.role === "admin"
              ? [
                  {
                    label: "Role",
                    value: "Admin",
                    icon: "bi-shield-check",
                  },
                  {
                    label: "Status",
                    value: profile.is_active ? "Aktif" : "Nonaktif",
                    icon: "bi-toggle-on",
                  },
                  {
                    label: "Bergabung",
                    value: profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString(
                          "id-ID",
                          { month: "short", year: "numeric" },
                        )
                      : "-",
                    icon: "bi-calendar-check",
                  },
                ]
              : [
                  {
                    label: "Donasi",
                    value: profile.profile?.total_donations || 0,
                    icon: "bi-box-seam",
                  },
                  {
                    label: "Klaim",
                    value: profile.profile?.total_claims || 0,
                    icon: "bi-hand-index",
                  },
                  {
                    label: "Poin",
                    value: profile.total_points || 0,
                    icon: "bi-lightning-charge",
                  },
                ]
            ).map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "18px 12px",
                  textAlign: "center",
                  borderRight: i < 2 ? "1px solid var(--border)" : "none",
                }}
              >
                <i
                  className={`bi ${s.icon}`}
                  style={{
                    fontSize: 16,
                    color: "var(--g2)",
                    marginBottom: 4,
                    display: "block",
                  }}
                />
                <p
                  className="syne-h1"
                  style={{ fontSize: 20, color: "var(--txt)", marginBottom: 2 }}
                >
                  {s.value}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--txt4)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Toast */}
        {msg === "success" && (
          <div
            style={{
              background: "rgba(95,139,76,0.12)",
              border: "1px solid rgba(95,139,76,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              color: "var(--g1)",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <i className="bi bi-check-circle-fill" /> Profil berhasil
            diperbarui!
          </div>
        )}
        {msg === "error" && (
          <div
            style={{
              background: "rgba(224,80,80,0.1)",
              border: "1px solid rgba(224,80,80,0.3)",
              borderRadius: 12,
              padding: "12px 16px",
              color: "#e05050",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <i className="bi bi-exclamation-circle-fill" /> Gagal memperbarui
            profil
          </div>
        )}

        {/* Info / Edit Card */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            boxShadow: "var(--shadow)",
            overflow: "hidden",
          }}
        >
          {/* Card header */}
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--surf2)",
            }}
          >
            <span
              className="syne-h1"
              style={{ fontSize: 14, color: "var(--txt)" }}
            >
              {editMode ? "✏️ Edit Profil" : "👤 Informasi Akun"}
            </span>
            {!editMode && (
              <button
                className="btn-outline-green"
                onClick={() => setEditMode(true)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 9,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <i className="bi bi-pencil me-1" /> Edit
              </button>
            )}
          </div>

          <div style={{ padding: "20px 24px" }}>
            {!editMode ? (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                {[
                  { icon: "bi-envelope", label: "Email", value: profile.email },
                  {
                    icon: "bi-telephone",
                    label: "No. HP",
                    value: profile.phone || "-",
                  },
                  {
                    icon: "bi-geo-alt",
                    label: "Kota",
                    value: profile.city || "-",
                  },
                  {
                    icon: "bi-chat-square-text",
                    label: "Bio",
                    value: profile.profile?.bio || "-",
                  },
                  {
                    icon: "bi-calendar3",
                    label: "Bergabung sejak",
                    value: new Date(profile.created_at).toLocaleDateString(
                      "id-ID",
                      { day: "numeric", month: "long", year: "numeric" },
                    ),
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "var(--g5)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <i
                        className={`bi ${item.icon}`}
                        style={{ fontSize: 14, color: "var(--g1)" }}
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--txt4)",
                          marginBottom: 2,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </p>
                      <p
                        style={{
                          fontSize: 14,
                          color: "var(--txt)",
                          fontWeight: 600,
                        }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}

                <div
                  style={{
                    borderTop: "1px solid var(--border)",
                    paddingTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <button
                    className="btn-green-gradient"
                    onClick={() => setEditMode(true)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    <i className="bi bi-pencil me-2" /> Edit Profil
                  </button>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background: "rgba(224,80,80,0.08)",
                      border: "1px solid rgba(224,80,80,0.25)",
                      color: "#e05050",
                    }}
                  >
                    <i className="bi bi-box-arrow-left me-2" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <div
                  className="form-grid-2col"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--txt4)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Nama Depan
                    </label>
                    <input
                      className="form-control input-green"
                      value={form.first_name}
                      onChange={(e) =>
                        setForm({ ...form, first_name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--txt4)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      Nama Belakang
                    </label>
                    <input
                      className="form-control input-green"
                      value={form.last_name}
                      onChange={(e) =>
                        setForm({ ...form, last_name: e.target.value })
                      }
                    />
                  </div>
                </div>
                {[
                  {
                    label: "Username",
                    key: "username",
                    placeholder: "min. 6 karakter",
                  },
                  {
                    label: "No. HP",
                    key: "phone",
                    placeholder: "cth: 08123456789",
                  },
                  { label: "Kota", key: "city", placeholder: "cth: Medan" },
                ].map((f) => (
                  <div key={f.key}>
                    <label
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--txt4)",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 6,
                      }}
                    >
                      {f.label}
                    </label>
                    <input
                      className="form-control input-green"
                      value={form[f.key]}
                      placeholder={f.placeholder}
                      onChange={(e) =>
                        setForm({ ...form, [f.key]: e.target.value })
                      }
                    />
                  </div>
                ))}
                <div>
                  <label
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--txt4)",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    Bio
                  </label>
                  <textarea
                    className="form-control input-green"
                    rows={3}
                    value={form.bio}
                    maxLength={500}
                    placeholder="Ceritakan sedikit tentang dirimu..."
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    style={{ resize: "vertical" }}
                  />
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--txt4)",
                      marginTop: 4,
                      textAlign: "right",
                    }}
                  >
                    {form.bio.length}/500
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                  <button
                    onClick={() => setEditMode(false)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background: "var(--surf2)",
                      border: "1px solid var(--border)",
                      color: "var(--txt3)",
                    }}
                  >
                    Batal
                  </button>
                  <button
                    className="btn-green-gradient"
                    onClick={handleSave}
                    style={{
                      flex: 1,
                      padding: "12px",
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      border: "none",
                    }}
                  >
                    <i className="bi bi-check2 me-1" /> Simpan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
