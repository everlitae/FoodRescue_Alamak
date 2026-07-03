import { Link } from "react-router-dom";
import api from "../utils/api";
import React from "react";
import { withRouter } from "../Wrapper/withRouter";

class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile: null,
      donations: [],
      userPos: null,
      locationLoading: false,
      locationError: null,
    };
  }

  tryGetLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        this.setState({
          userPos: { lat: latitude, lng: longitude, accuracy },
          locationLoading: true,
        });
        if (accuracy > 100)
          console.warn("Lokasi kurang akurat:", accuracy, "meter");
      },
      () => {
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((data) => {
            if (data.latitude && data.longitude) {
              this.setState({
                userPos: {
                  lat: data.latitude,
                  lng: data.longitude,
                  accuracy: data.accuracy,
                },
                locationLoading: false,
              });
            } else {
              this.setState({
                locationError: "Gagal deteksi lokasi",
                locationLoading: false,
              });
            }
          })
          .catch(() =>
            this.setState({
              locationError: "Gagal deteksi lokasi",
              locationLoading: false,
            }),
          );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  fetchDonation = async () => {
    const params = new URLSearchParams();
    params.append("city", "");
    params.append("search", "");
    params.append("filter", "");
    params.append("halal", "");
    const res = await api.get(`/donations?${params.toString()}`);
    this.setState({ donations: res.data.slice(0, 6) });
  };

  getStatusBadge = (status) => {
    if (status === "available")
      return <span className="badge bg-success">Tersedia</span>;
    if (status === "partially_claimed")
      return <span className="badge bg-info">Sebagian Diklaim</span>;
    return <span className="badge bg-secondary">{status}</span>;
  };

  getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  componentDidMount() {
    api
      .get("/users/profile")
      .then((res) => {
        this.setState({ profile: res.data });
      })
      .catch(() => {});
    this.fetchDonation();
    this.tryGetLocation();
  }

  render() {
    const isProvider = this.state.profile?.role === "food_provider";
    const isAdmin = this.state.profile?.role === "admin";
    const isProfileComplete =
      this.state.profile?.is_profile_complete ??
      this.props.auth?.user?.is_profile_complete;

    const filteredDonations = this.state.donations.filter((d) => {
      if (this.state.userPos) {
        const coords = d.pickup_location?.coordinates;
        if (coords && !(coords[0] === 0 && coords[1] === 0)) {
          const dist = this.getDistance(
            this.state.userPos.lat,
            this.state.userPos.lng,
            coords[1],
            coords[0],
          );
          if (dist > 100) return false;
        }
      }
      return true;
    });

    return (
      <div className="container-md outfit position-relative py-4 py-md-5 px-4 px-md-5">
        {/* ── BANNER LENGKAPI PROFIL ─────────────────────────────── */}
        {!isProfileComplete && (
          <div
            style={{
              background:
                "linear-gradient(135deg, rgba(95,139,76,0.12), rgba(184,105,74,0.08))",
              border: "1px solid rgba(95,139,76,0.35)",
              borderRadius: 16,
              padding: "16px 20px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--g1), var(--g2))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <i
                  className="bi bi-person-exclamation"
                  style={{ color: "#fff", fontSize: 18 }}
                />
              </div>
              <div>
                <p
                  className="outfit mb-0"
                  style={{ fontWeight: 700, fontSize: 14, color: "var(--txt)" }}
                >
                  Profil kamu belum lengkap
                </p>
                <p
                  className="outfit mb-0"
                  style={{ fontSize: 12, color: "var(--txt3)" }}
                >
                  Lengkapi profil untuk bisa mengakses semua fitur FoodRescue
                </p>
              </div>
            </div>
            <Link
              to="/complete-profile"
              className="btn btn-green-gradient py-2 px-4 fw-bold outfit"
              style={{
                textDecoration: "none",
                fontSize: 13,
                whiteSpace: "nowrap",
              }}
            >
              <i className="bi bi-arrow-right-circle me-2" />
              Lengkapi Sekarang
            </Link>
          </div>
        )}

        {/* ── HERO BANNER ───────────────────────────────────────────── */}
        <div className="p-4 p-md-5 left-signin rounded-4 position-relative grid-detail-light">
          <span
            className="card-transparent text-white fw-semibold py-1 px-2 rounded-5"
            style={{ fontSize: "small" }}
          >
            {(() => {
              const role =
                this.state.profile?.role ?? this.props.auth?.user?.role;
              if (role === "food_provider") return "🍱 Food Provider";
              if (role === "admin") return "⚙️ Admin";
              if (role === "food_seeker") return "🤲 Food Seeker";
              return null;
            })()}
          </span>

          <h1 className="text-white syne-h1 my-3">
            Selamat Datang Kembali,{" "}
            {this.state.profile?.first_name ??
              this.props.auth?.user?.first_name}{" "}
            👋
          </h1>

          <p className="text-light">
            {isProvider
              ? this.state.profile?.profile?.total_donations === 0
                ? "Kamu belum mendonasikan makanan sejauh ini. Mari bersama membantu yang membutuhkan!"
                : `Kamu telah mendonasikan ${this.state.profile?.profile.total_donations} porsi makanan. Terus semangat membantu sesama!`
              : this.state.profile?.profile?.total_claims === 0
                ? "Kamu masih ada kesempatan untuk claim makanan donatur!"
                : `Kamu telah claim ${this.state.profile?.profile.total_claims} porsi makanan. Semoga anda sehat selalu!`}
          </p>

          <div className="position-relative mt-4 d-flex gap-2">
            {isProvider ? (
              isProfileComplete ? (
                <Link
                  to="/donations/create"
                  className="btn btn-green-gradient py-2 px-4 fw-bold"
                  style={{
                    background: "#FFFFFF",
                    color: "var(--g1)",
                    textDecoration: "none",
                  }}
                >
                  <i className="bi bi-gift me-2"></i>Donasi Sekarang
                </Link>
              ) : (
                <Link
                  to="/complete-profile"
                  className="btn py-2 px-4 fw-bold"
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 8,
                  }}
                >
                  <i className="bi bi-lock me-2"></i>Donasi Sekarang
                </Link>
              )
            ) : isProfileComplete ? (
              <Link
                to="/donations"
                className="btn btn-green-gradient py-2 px-4 fw-bold"
                style={{
                  background: "#FFFFFF",
                  color: "var(--g1)",
                  textDecoration: "none",
                }}
              >
                <i className="bi bi-search me-2"></i>Cari Donasi
              </Link>
            ) : (
              <Link
                to="/complete-profile"
                className="btn py-2 px-4 fw-bold"
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  textDecoration: "none",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 8,
                }}
              >
                <i className="bi bi-lock me-2"></i>Cari Donasi
              </Link>
            )}
            <Link
              className="btn btn-green-gradient py-2 px-4 fw-bold"
              to="/donations"
              style={{ textDecoration: "none" }}
            >
              <i className="bi bi-map me-2"></i>Lihat Peta
            </Link>
          </div>
        </div>

        {/* ── QUICK ACTIONS ─────────────────────────────────────────── */}
        <div className="mt-5">
          {isAdmin ? (
            (() => {
              const adminCards = [
                {
                  to: "/admin?tab=stats",
                  emoji: "📊",
                  label: "Statistik",
                  desc: "Ringkasan platform",
                  color: "#5f8b4c",
                },
                {
                  to: "/admin?tab=users",
                  emoji: "👥",
                  label: "Pengguna",
                  desc: "Kelola akun",
                  color: "#1e7ab8",
                },
                {
                  to: "/admin?tab=donations",
                  emoji: "📦",
                  label: "Donasi",
                  desc: "Pantau semua donasi",
                  color: "#c8900a",
                },
                {
                  to: "/admin?tab=reports",
                  emoji: "🚩",
                  label: "Laporan",
                  desc: "Tinjau laporan masuk",
                  color: "#e05050",
                },
                {
                  to: "/admin?tab=conversations",
                  emoji: "💬",
                  label: "Chat",
                  desc: "Monitor percakapan",
                  color: "#7c5cbf",
                },
                {
                  to: "/admin?tab=community",
                  emoji: "🌐",
                  label: "Komunitas",
                  desc: "Moderasi post",
                  color: "#4eb8d4",
                },
                {
                  to: "/admin?tab=categories",
                  emoji: "🏷️",
                  label: "Kategori",
                  desc: "Kelola kategori",
                  color: "#b8694a",
                },
              ];
              const rows = [adminCards.slice(0, 4), adminCards.slice(4, 7)];

              const renderCard = (item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="text-decoration-none d-flex flex-column gap-1 rounded-4 align-items-center adm-quick-card"
                  style={{
                    flex: "1 1 0",
                    minWidth: 150,
                    padding: "24px 16px",
                    background: `${item.color}14`,
                    border: `1px solid ${item.color}35`,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `${item.color}22`;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `${item.color}14`;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  <h1 style={{ margin: 0 }}>{item.emoji}</h1>
                  <p
                    className="fw-bold text-nowrap"
                    style={{
                      fontSize: "small",
                      color: item.color,
                      margin: 0,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    className="text-green4 text-nowrap"
                    style={{ fontSize: "small", margin: 0 }}
                  >
                    {item.desc}
                  </p>
                </Link>
              );

              return (
                <div className="d-flex flex-column gap-2">
                  {rows.map((row, i) => (
                    <div
                      key={i}
                      className="adm-quick-row"
                      style={{ display: "flex", flexWrap: "wrap", gap: 10 }}
                    >
                      {row.map(renderCard)}
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (
            <div className="row align-items-center justify-content-center gap-2">
              {isProvider ? (
                <Link
                  className="col card-green py-4 px-5 d-flex flex-column gap-1 rounded-4 text-decoration-none align-items-center"
                  to={
                    isProfileComplete
                      ? "/donations/create"
                      : "/complete-profile"
                  }
                  style={
                    !isProfileComplete
                      ? { opacity: 0.6, position: "relative" }
                      : {}
                  }
                >
                  {!isProfileComplete && (
                    <i
                      className="bi bi-lock-fill"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 10,
                        fontSize: 11,
                        color: "var(--txt4)",
                      }}
                    />
                  )}
                  <h1>🍱</h1>
                  <p
                    className="text-green1 fw-bold text-nowrap"
                    style={{ fontSize: "small" }}
                  >
                    Buat Donasi
                  </p>
                  <p
                    className="text-green4 text-nowrap"
                    style={{ fontSize: "small" }}
                  >
                    Bagikan makanan
                  </p>
                </Link>
              ) : (
                <Link
                  className="col card-green py-4 px-5 d-flex flex-column gap-1 rounded-4 text-decoration-none align-items-center"
                  to={isProfileComplete ? "/donations" : "/complete-profile"}
                  style={
                    !isProfileComplete
                      ? { opacity: 0.6, position: "relative" }
                      : {}
                  }
                >
                  {!isProfileComplete && (
                    <i
                      className="bi bi-lock-fill"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 10,
                        fontSize: 11,
                        color: "var(--txt4)",
                      }}
                    />
                  )}
                  <h1>🔎</h1>
                  <p
                    className="text-green1 fw-bold text-nowrap"
                    style={{ fontSize: "small" }}
                  >
                    Cari Donasi
                  </p>
                  <p
                    className="text-green4 text-nowrap"
                    style={{ fontSize: "small" }}
                  >
                    Temukan makanan
                  </p>
                </Link>
              )}

              <Link
                className="col card-green py-4 px-5 d-flex flex-column gap-1 rounded-4 text-decoration-none align-items-center"
                to={isProfileComplete ? "/messages" : "/complete-profile"}
                style={
                  !isProfileComplete
                    ? { opacity: 0.6, position: "relative" }
                    : {}
                }
              >
                {!isProfileComplete && (
                  <i
                    className="bi bi-lock-fill"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 10,
                      fontSize: 11,
                      color: "var(--txt4)",
                    }}
                  />
                )}
                <h1>💬</h1>
                <p
                  className="text-green1 fw-bold text-nowrap"
                  style={{ fontSize: "small" }}
                >
                  Chat
                </p>
                <p
                  className="text-green4 text-nowrap"
                  style={{ fontSize: "small" }}
                >
                  Berbicara langsung
                </p>
              </Link>

              <Link
                className="col card-green py-4 px-5 d-flex flex-column gap-1 rounded-4 text-decoration-none align-items-center"
                to={isProfileComplete ? "/community" : "/complete-profile"}
                style={
                  !isProfileComplete
                    ? { opacity: 0.6, position: "relative" }
                    : {}
                }
              >
                {!isProfileComplete && (
                  <i
                    className="bi bi-lock-fill"
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 10,
                      fontSize: 11,
                      color: "var(--txt4)",
                    }}
                  />
                )}
                <h1>👥</h1>
                <p
                  className="text-green1 fw-bold text-nowrap"
                  style={{ fontSize: "small" }}
                >
                  Komunitas
                </p>
                <p
                  className="text-green4 text-nowrap"
                  style={{ fontSize: "small" }}
                >
                  Forum Diskusi
                </p>
              </Link>
            </div>
          )}
        </div>

        {/* ── STATS ─────────────────────────────────────────────────── */}
        {!isAdmin && (
          <div className="w-100 row align-items-center justify-content-center mt-3 g-0 gap-2">
            {isProvider ? (
              <div className="col card-basic py-4 px-5 rounded-4">
                <h1 className="syne-h1 text-green1">
                  {this.state.profile?.profile.total_donations}
                </h1>
                <p className="text-green3 text-nowrap">TOTAL DONASI</p>
              </div>
            ) : (
              <div className="col card-basic py-4 px-5 rounded-4">
                <h1 className="syne-h1 text-green1">
                  {this.state.profile?.profile.total_claims}
                </h1>
                <p className="text-green3 text-nowrap">CLAIM</p>
              </div>
            )}
            <div className="col card-basic py-4 px-5 rounded-4">
              <h1 className="syne-h1 text-green1">
                {this.state.profile?.total_points}
              </h1>
              <p className="text-green3 text-nowrap">TOTAL POINS</p>
            </div>
            <div className="col card-basic py-4 px-5 rounded-4">
              <h1 className="syne-h1 text-green1">
                {this.state.profile?.trust_score}{" "}
                <i className="bi bi-star-fill text-cream3"></i>
              </h1>
              <p className="text-green3 text-nowrap">RATING KAMU</p>
            </div>
          </div>
        )}

        {/* ── DONASI TERSEDIA ───────────────────────────────────────── */}
        <div className="mt-5">
          <h4 className="syne-h1 text-green1 mb-3">Donasi Tersedia Sekarang</h4>
          {filteredDonations.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-basket2 display-3 text-green4"></i>
              <p className="text-green4 mt-2">Tidak ada donasi</p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 10,
              }}
            >
              {filteredDonations.map((d) => {
                const dist =
                  this.state.userPos &&
                  d.pickup_location?.coordinates &&
                  !(d.pickup_location.coordinates[0] === 0)
                    ? this.getDistance(
                        this.state.userPos.lat,
                        this.state.userPos.lng,
                        d.pickup_location.coordinates[1],
                        d.pickup_location.coordinates[0],
                      ).toFixed(1)
                    : null;

                return (
                  <div
                    key={d._id}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: 16,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: "var(--shadow)",
                      transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--g3)";
                      e.currentTarget.style.boxShadow = "var(--shadow2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.boxShadow = "var(--shadow)";
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      {d.photos?.length > 0 ? (
                        <img
                          src={d.photos[0].photo_url}
                          alt={d.title}
                          style={{
                            width: "100%",
                            height: "auto",
                            maxHeight: 220,
                            objectFit: "contain",
                            display: "block",
                            background: "var(--surf2)",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            height: 100,
                            background: "var(--surf2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <i
                            className="bi bi-image"
                            style={{ fontSize: 24, color: "var(--txt4)" }}
                          />
                        </div>
                      )}
                      <div style={{ position: "absolute", top: 6, right: 6 }}>
                        {this.getStatusBadge(d.status)}
                      </div>
                      {dist && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 6,
                            left: 6,
                            background: "rgba(11,21,9,0.8)",
                            backdropFilter: "blur(4px)",
                            border: "1px solid rgba(95,139,76,0.3)",
                            borderRadius: 20,
                            padding: "2px 8px",
                            color: "var(--g2)",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          <i className="bi bi-geo me-1" />
                          {dist} km
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: "10px 12px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <h6
                        className="syne-h1"
                        style={{
                          fontSize: 12,
                          color: "var(--txt)",
                          marginBottom: 6,
                          lineHeight: 1.3,
                        }}
                      >
                        {d.title}
                      </h6>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 3,
                          marginBottom: 8,
                        }}
                      >
                        {d.category_id && (
                          <span
                            style={{
                              background: "var(--g5)",
                              color: "var(--txt3)",
                              border: "1px solid var(--border)",
                              borderRadius: 20,
                              fontSize: 10,
                              padding: "2px 8px",
                              fontWeight: 600,
                            }}
                          >
                            {d.category_id.icon_emoji} {d.category_id.name}
                          </span>
                        )}
                        {d.is_halal && (
                          <span
                            style={{
                              background: "rgba(95,139,76,0.1)",
                              color: "var(--g2)",
                              border: "1px solid rgba(95,139,76,0.25)",
                              borderRadius: 20,
                              fontSize: 10,
                              padding: "2px 8px",
                              fontWeight: 600,
                            }}
                          >
                            ✅ Halal
                          </span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 4,
                          }}
                        >
                          <i
                            className="bi bi-box"
                            style={{
                              color: "var(--txt4)",
                              fontSize: 10,
                              width: 12,
                            }}
                          />
                          <span style={{ fontSize: 11, color: "var(--txt3)" }}>
                            {d.quantity_remaining}/{d.quantity}{" "}
                            {d.quantity_unit}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 4,
                          }}
                        >
                          <i
                            className="bi bi-geo-alt"
                            style={{
                              color: "var(--txt4)",
                              fontSize: 10,
                              width: 12,
                            }}
                          />
                          <span style={{ fontSize: 11, color: "var(--txt3)" }}>
                            {d.pickup_city}
                          </span>
                        </div>
                        {d.pickup_start_time && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              marginBottom: 4,
                            }}
                          >
                            <i
                              className="bi bi-clock"
                              style={{
                                color: "var(--txt4)",
                                fontSize: 10,
                                width: 12,
                              }}
                            />
                            <span
                              style={{ fontSize: 11, color: "var(--txt3)" }}
                            >
                              {d.pickup_start_time} – {d.pickup_end_time}
                            </span>
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            marginBottom: 10,
                          }}
                        >
                          <i
                            className="bi bi-person"
                            style={{
                              color: "var(--txt4)",
                              fontSize: 10,
                              width: 12,
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--txt3)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 80,
                            }}
                          >
                            {d.provider_id?.first_name}{" "}
                            {d.provider_id?.last_name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#e8b84b",
                              marginLeft: "auto",
                              flexShrink: 0,
                            }}
                          >
                            ★ {d.provider_id?.trust_score?.toFixed(1) || "5.0"}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/donations/${d._id}`}
                        className="btn-green-gradient"
                        style={{
                          display: "block",
                          textAlign: "center",
                          textDecoration: "none",
                          borderRadius: 8,
                          padding: "6px 0",
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "inherit",
                        }}
                      >
                        Detail →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(Home);
