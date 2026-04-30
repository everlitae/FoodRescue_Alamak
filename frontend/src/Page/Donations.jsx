import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import MapView from "../Component/MapView";
import { useAuth } from "../Context/AuthContext";

function Donations() {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: "",
    city: "",
    search: "",
    halal: "",
    pickup_start: "",
    pickup_end: "",
  });
  const [radius, setRadius] = useState(10);
  const [userPos, setUserPos] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const isProviderRole = user?.role === "food_provider";

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.category) params.append("category", filter.category);
      if (filter.city) params.append("city", filter.city);
      if (filter.search) params.append("search", filter.search);
      if (filter.halal) params.append("halal", filter.halal);
      const res = await api.get(`/donations?${params.toString()}`);
      setDonations(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const tryGetLocation = (onSuccess, onError) => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        onSuccess({ lat: latitude, lng: longitude, accuracy });
      },
      () => {
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((data) => {
            if (data.latitude && data.longitude)
              onSuccess({ lat: data.latitude, lng: data.longitude });
            else onError();
          })
          .catch(onError);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    setLocationLoading(true);
    tryGetLocation(
      (pos) => {
        setUserPos(pos);
        setLocationLoading(false);
      },
      () => {
        setLocationError("Gagal deteksi lokasi");
        setLocationLoading(false);
      },
    );
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDonations();
  }, [filter]);

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const isInTimeRange = (d) => {
    if (!filter.pickup_start || !filter.pickup_end) return true;
    if (!d.pickup_start_time || !d.pickup_end_time) return false;
    return (
      d.pickup_start_time >= filter.pickup_start &&
      d.pickup_end_time <= filter.pickup_end
    );
  };

  const filteredDonations = donations.filter((d) => {
    if (userPos) {
      const coords = d.pickup_location?.coordinates;
      if (coords && !(coords[0] === 0 && coords[1] === 0)) {
        if (
          getDistance(userPos.lat, userPos.lng, coords[1], coords[0]) > radius
        )
          return false;
      }
    }
    if (filter.halal === "true" && d.is_halal !== true) return false;
    if (filter.halal === "false" && d.is_halal !== false) return false;
    if (!isInTimeRange(d)) return false;
    return true;
  });

  const getStatusBadge = (status) => {
    if (status === "available")
      return (
        <span
          className="badge"
          style={{
            background: "rgba(95,139,76,0.15)",
            color: "var(--g2)",
            border: "1px solid rgba(95,139,76,0.3)",
            fontSize: "0.65rem",
            borderRadius: 20,
          }}
        >
          ● Tersedia
        </span>
      );
    if (status === "partially_claimed")
      return (
        <span
          className="badge"
          style={{
            background: "rgba(255,200,100,0.12)",
            color: "#e8b84b",
            border: "1px solid rgba(255,200,100,0.3)",
            fontSize: "0.65rem",
            borderRadius: 20,
          }}
        >
          ◑ Sebagian
        </span>
      );
    return (
      <span
        className="badge bg-secondary"
        style={{ fontSize: "0.65rem", borderRadius: 20 }}
      >
        {status}
      </span>
    );
  };

  const hasActiveFilter =
    filter.search ||
    filter.category ||
    filter.city ||
    filter.halal ||
    filter.pickup_start ||
    filter.pickup_end;

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
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div className="d-flex align-items-center gap-2">
            <i
              className="bi bi-box-seam"
              style={{ fontSize: 35, color: "var(--g1)", lineHeight: 1 }}
            />
            <h4
              className="syne-h1 mb-0"
              style={{ color: "var(--txt)", fontSize: 22, lineHeight: 1 }}
            >
              Jelajahi Donasi
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isProviderRole && (
              <div
                style={{
                  background: "rgba(232,184,75,0.12)",
                  border: "1px solid rgba(232,184,75,0.3)",
                  borderRadius: 10,
                  padding: "6px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i
                  className="bi bi-eye"
                  style={{ color: "#e8b84b", fontSize: 12 }}
                />
                <span
                  style={{ color: "#e8b84b", fontSize: 12, fontWeight: 600 }}
                >
                  Mode Lihat — kamu tidak dapat mengklaim
                </span>
              </div>
            )}
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
                  boxShadow: "0 0 8px var(--g2)",
                }}
              />
              <span
                style={{ color: "var(--g2)", fontSize: 13, fontWeight: 600 }}
              >
                {filteredDonations.length} donasi
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid py-0">
        <div className="row g-0">
          <div
            className="col-md-5"
            style={{
              height: "calc(100vh - 116px)",
              display: "flex",
              flexDirection: "column",
              padding: "16px 12px 16px 16px",
            }}
          >
            <div
              style={{
                flex: 1,
                minHeight: 0,
                borderRadius: 16,
                overflow: "hidden",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow)",
                position: "relative",
              }}
            >
              <MapView donations={filteredDonations} userPos={userPos} />
              <div
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  zIndex: 10,
                  background: "rgba(11,21,9,0.85)",
                  border: "1px solid var(--border)",
                  backdropFilter: "blur(8px)",
                  borderRadius: 10,
                  padding: "6px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <i
                  className="bi bi-map"
                  style={{ color: "var(--g2)", fontSize: 12 }}
                />
                <span
                  style={{
                    color: "var(--g3)",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  PETA DONASI
                </span>
              </div>
            </div>
            <div
              style={{
                marginTop: 12,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "16px 18px",
                boxShadow: "var(--shadow)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                      className="bi bi-geo-alt"
                      style={{ color: "var(--g2)", fontSize: 14 }}
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--txt)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      Radius Pencarian
                    </p>
                    {userPos && (
                      <p
                        style={{ margin: 0, fontSize: 11, color: "var(--g2)" }}
                      >
                        ✓ Lokasi aktif
                      </p>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    background: "rgba(95,139,76,0.1)",
                    border: "1px solid rgba(95,139,76,0.25)",
                    borderRadius: 8,
                    padding: "4px 12px",
                  }}
                >
                  <span
                    className="syne-h1"
                    style={{ color: "var(--g2)", fontSize: 15 }}
                  >
                    {radius} km
                  </span>
                </div>
              </div>

              {locationLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <div
                    className="spinner-border spinner-border-sm"
                    style={{ color: "var(--g2)", width: 14, height: 14 }}
                  />
                  <small style={{ color: "var(--txt3)", fontSize: 12 }}>
                    Mendeteksi lokasi...
                  </small>
                </div>
              )}

              {!userPos && !locationLoading && (
                <button
                  className="btn-green-gradient w-100 mb-2"
                  style={{
                    border: "none",
                    borderRadius: 10,
                    padding: "9px 0",
                    fontSize: 13,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    fontWeight: 600,
                  }}
                  onClick={() => {
                    setLocationLoading(true);
                    setLocationError("");
                    tryGetLocation(
                      (pos) => {
                        setUserPos(pos);
                        setLocationLoading(false);
                      },
                      () => {
                        setLocationError("Gagal deteksi lokasi");
                        setLocationLoading(false);
                      },
                    );
                  }}
                >
                  <i className="bi bi-crosshair me-2" />
                  Deteksi Lokasi Saya
                </button>
              )}

              {locationError && (
                <small
                  style={{
                    color: "#e05050",
                    display: "block",
                    marginBottom: 8,
                    fontSize: 11,
                  }}
                >
                  <i className="bi bi-exclamation-triangle me-1" />
                  {locationError}
                </small>
              )}

              <input
                type="range"
                className="custom-range"
                min="1"
                max="50"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                disabled={!userPos}
                style={{ width: "100%", opacity: userPos ? 1 : 0.4 }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 4,
                }}
              >
                <small style={{ color: "var(--txt4)", fontSize: 10 }}>
                  1 km
                </small>
                <small style={{ color: "var(--txt4)", fontSize: 10 }}>
                  50 km
                </small>
              </div>
            </div>
          </div>

          <div
            className="col-md-7"
            style={{
              height: "calc(100vh - 116px)",
              overflowY: "auto",
              overflowX: "hidden",
              padding: "0",
              background: "var(--bg)",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 20,
                background: "var(--bg)",
                padding: "16px 16px 10px 12px",
              }}
            >
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "12px 14px",
                  boxShadow: "var(--shadow2)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
                  }}
                >
                  <i
                    className="bi bi-sliders"
                    style={{ color: "var(--g2)", fontSize: 13 }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--txt3)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Filter Pencarian
                  </span>
                  {hasActiveFilter && (
                    <button
                      onClick={() =>
                        setFilter({
                          category: "",
                          city: "",
                          search: "",
                          halal: "",
                          pickup_start: "",
                          pickup_end: "",
                        })
                      }
                      style={{
                        marginLeft: "auto",
                        background: "rgba(224,80,80,0.1)",
                        border: "1px solid rgba(224,80,80,0.25)",
                        color: "#e05050",
                        borderRadius: 8,
                        padding: "2px 10px",
                        fontSize: 11,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <i className="bi bi-x me-1" />
                      Reset
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <i
                      className="bi bi-search"
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--txt4)",
                        fontSize: 12,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      className="input-green"
                      placeholder="Cari donasi..."
                      value={filter.search}
                      onChange={(e) =>
                        setFilter({ ...filter, search: e.target.value })
                      }
                      style={{
                        width: "100%",
                        height: 36,
                        paddingLeft: 30,
                        paddingRight: 10,
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                        fontFamily: "inherit",
                        background: "var(--g5)",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <select
                    className="input-green"
                    value={filter.category}
                    onChange={(e) =>
                      setFilter({ ...filter, category: e.target.value })
                    }
                    style={{
                      height: 36,
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      padding: "0 8px",
                      fontSize: 12,
                      fontFamily: "inherit",
                      background: "var(--g5)",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">🏷️ Kategori</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.icon_emoji} {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="input-green"
                    value={filter.halal}
                    onChange={(e) =>
                      setFilter({ ...filter, halal: e.target.value })
                    }
                    style={{
                      height: 36,
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      padding: "0 8px",
                      fontSize: 12,
                      fontFamily: "inherit",
                      background: "var(--g5)",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">🍽️ Semua</option>
                    <option value="true">✅ Halal</option>
                    <option value="false">❌ Non-Halal</option>
                  </select>
                  <div style={{ position: "relative" }}>
                    <i
                      className="bi bi-geo"
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "var(--txt4)",
                        fontSize: 12,
                        pointerEvents: "none",
                      }}
                    />
                    <input
                      className="input-green"
                      placeholder="Kota"
                      value={filter.city}
                      onChange={(e) =>
                        setFilter({ ...filter, city: e.target.value })
                      }
                      style={{
                        width: "100%",
                        height: 36,
                        paddingLeft: 28,
                        paddingRight: 8,
                        borderRadius: 8,
                        border: "1px solid var(--border)",
                        fontSize: 12,
                        fontFamily: "inherit",
                        background: "var(--g5)",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: "0 16px 16px 12px" }}>
              {loading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px 0",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 14,
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
                  <p style={{ color: "var(--txt4)", fontSize: 13, margin: 0 }}>
                    Memuat donasi...
                  </p>
                </div>
              ) : filteredDonations.length === 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 300,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    padding: "40px 24px",
                  }}
                >
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      margin: "0 auto 16px",
                      background: "rgba(95,139,76,0.08)",
                      border: "1px solid var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 28,
                    }}
                  >
                    🧺
                  </div>
                  <p
                    className="syne-h1"
                    style={{
                      color: "var(--txt)",
                      fontSize: 16,
                      marginBottom: 8,
                    }}
                  >
                    Tidak ada donasi
                  </p>
                  <p style={{ color: "var(--txt4)", fontSize: 13 }}>
                    Coba ubah filter atau perluas radius pencarian
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: 10,
                  }}
                >
                  {filteredDonations.map((d) => {
                    const dist =
                      userPos &&
                      d.pickup_location?.coordinates &&
                      !(d.pickup_location.coordinates[0] === 0)
                        ? getDistance(
                            userPos.lat,
                            userPos.lng,
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
                          <div
                            style={{ position: "absolute", top: 6, right: 6 }}
                          >
                            {getStatusBadge(d.status)}
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
                          {isProviderRole && (
                            <div
                              style={{
                                position: "absolute",
                                top: 6,
                                left: 6,
                                background: "rgba(232,184,75,0.85)",
                                backdropFilter: "blur(4px)",
                                borderRadius: 20,
                                padding: "2px 8px",
                                color: "#000",
                                fontSize: 9,
                                fontWeight: 700,
                              }}
                            >
                              👁️ Lihat saja
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
                              <span
                                style={{ fontSize: 11, color: "var(--txt3)" }}
                              >
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
                              <span
                                style={{ fontSize: 11, color: "var(--txt3)" }}
                              >
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
                                ★{" "}
                                {d.provider_id?.trust_score?.toFixed(1) ||
                                  "5.0"}
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
                            {isProviderRole ? "Lihat Detail →" : "Detail →"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Donations;
