import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../utils/api";
import socket from "../utils/socket";

// ── Futuristic style injector ──
const injectAdminStyles = () => {
  if (document.getElementById("admin-fx-styles")) return;
  const s = document.createElement("style");
  s.id = "admin-fx-styles";
  s.textContent = `
    @keyframes admin-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes admin-scan  { 0%{transform:translateY(-100%)} 100%{transform:translateY(400px)} }
    @keyframes admin-fade  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes admin-blink { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} }

    .adm-root { animation: admin-fade 0.35s ease both; }

    .adm-tab {
      position: relative; padding: 9px 16px; border-radius: 8px;
      border: 1px solid transparent; background: none;
      font-family: inherit; font-size: 12px; font-weight: 700;
      color: var(--txt3); cursor: pointer; letter-spacing: 0.04em;
      transition: all 0.2s; white-space: nowrap;
    }
    .adm-tab:hover { color: var(--g2); border-color: rgba(122,175,96,0.2); background: rgba(122,175,96,0.06); }
    .adm-tab.active {
      color: var(--g1); border-color: rgba(95,139,76,0.4);
      background: rgba(95,139,76,0.1);
      box-shadow: 0 0 12px rgba(95,139,76,0.15), inset 0 0 12px rgba(95,139,76,0.05);
    }
    .adm-tab.active::before {
      content:''; position:absolute; bottom:-1px; left:20%; right:20%;
      height:2px; background:linear-gradient(90deg,transparent,var(--g1),transparent);
      border-radius:2px;
    }

    .adm-stat-card {
      position: relative; overflow: hidden;
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 14px; padding: 20px 18px;
      transition: all 0.25s; cursor: default;
    }
    .adm-stat-card::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background: linear-gradient(90deg, transparent, var(--g1), transparent);
      opacity: 0; transition: opacity 0.3s;
    }
    .adm-stat-card:hover { border-color: rgba(95,139,76,0.35); transform: translateY(-2px); box-shadow: var(--shadow2); }
    .adm-stat-card:hover::before { opacity: 1; }

    .adm-table { width:100%; border-collapse:separate; border-spacing:0 4px; }
    .adm-table thead th {
      padding: 10px 14px; font-size: 10px; font-weight: 800;
      letter-spacing: 0.12em; text-transform: uppercase; color: var(--txt4);
      background: var(--surf2); border-bottom: 1px solid var(--border);
    }
    .adm-table thead th:first-child { border-radius: 8px 0 0 8px; }
    .adm-table thead th:last-child  { border-radius: 0 8px 8px 0; }
    .adm-table tbody tr { transition: all 0.15s; }
    .adm-table tbody tr:hover td { background: rgba(95,139,76,0.06); }
    .adm-table tbody td {
      padding: 11px 14px; font-size: 13px; color: var(--txt);
      border-top: 1px solid transparent; border-bottom: 1px solid var(--border);
      background: var(--surface);
    }
    .adm-table tbody td:first-child { border-radius: 8px 0 0 8px; }
    .adm-table tbody td:last-child  { border-radius: 0 8px 8px 0; }

    .adm-badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 800;
      letter-spacing: 0.05em; text-transform: uppercase;
    }
    .adm-badge-green { background: rgba(95,139,76,0.12); color: var(--g1); border: 1px solid rgba(95,139,76,0.25); }
    .adm-badge-red   { background: rgba(224,80,80,0.1);  color: #e05050; border: 1px solid rgba(224,80,80,0.25); }
    .adm-badge-yellow{ background: rgba(255,180,0,0.1);  color: #c8900a; border: 1px solid rgba(255,180,0,0.25); }
    .adm-badge-gray  { background: rgba(150,150,150,0.1);color: var(--txt3); border: 1px solid var(--border); }
    .adm-badge-blue  { background: rgba(30,122,184,0.1); color: #1e7ab8; border: 1px solid rgba(30,122,184,0.25); }

    .adm-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 14px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--surf2); color: var(--txt3); font-size: 12px; font-weight: 700;
      font-family: inherit; cursor: pointer; transition: all 0.2s; letter-spacing: 0.03em;
    }
    .adm-btn:hover { border-color: var(--g2); color: var(--g1); background: rgba(95,139,76,0.08); }
    .adm-btn-danger { border-color: rgba(224,80,80,0.3); color: #e05050; background: rgba(224,80,80,0.05); }
    .adm-btn-danger:hover { background: rgba(224,80,80,0.12); border-color: #e05050; color: #e05050; }
    .adm-btn-success { border-color: rgba(95,139,76,0.4); color: var(--g1); background: rgba(95,139,76,0.08); }
    .adm-btn-success:hover { background: rgba(95,139,76,0.15); }
    .adm-btn-primary { background: linear-gradient(90deg,var(--g1),var(--g2)); color:#fff; border:none; box-shadow:0 4px 14px rgba(95,139,76,0.3); }
    .adm-btn-primary:hover { transform:translateY(-1px); box-shadow:0 6px 20px rgba(95,139,76,0.4); color:#fff; }

    .adm-input {
      background: var(--g5); border: 1px solid var(--border); border-radius: 8px;
      padding: 9px 12px; font-size: 13px; font-family: inherit; color: var(--txt);
      outline: none; width: 100%; box-sizing: border-box; transition: all 0.2s;
    }
    .adm-input:focus { border-color: var(--g2); background: var(--surface); box-shadow: 0 0 0 3px rgba(122,175,96,0.15); }
    .adm-input::placeholder { color: var(--txt4); }

    .adm-section { animation: admin-fade 0.25s ease both; }

    .adm-empty {
      text-align: center; padding: 40px 20px;
      color: var(--txt4); font-size: 13px;
    }
    .adm-empty i { font-size: 32px; display:block; margin-bottom: 8px; opacity:0.4; }
  `;
  document.head.appendChild(s);
};

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [reports, setReports] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [community, setCommunity] = useState([]);
  const [categories, setCategories] = useState([]);
  const location = useLocation();
  const validTabs = [
    "stats",
    "users",
    "donations",
    "reports",
    "conversations",
    "community",
    "categories",
  ];
  const tabFromUrl = new URLSearchParams(location.search).get("tab");
  const [tab, setTab] = useState(
    validTabs.includes(tabFromUrl) ? tabFromUrl : "stats",
  );
  const [msg, setMsg] = useState("");
  const [newCategory, setNewCategory] = useState({
    name: "",
    slug: "",
    icon_emoji: "",
  });

  useEffect(() => {
    injectAdminStyles();
  }, []);

  useEffect(() => {
    socket.connect();
    socket.emit("join_admin");

    socket.on("admin_new_message", ({ conversation_id, message }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c._id === conversation_id
            ? {
                ...c,
                messages: [...(c.messages || []), message],
                last_message_at: new Date(),
              }
            : c,
        ),
      );
    });

    return () => {
      socket.off("admin_new_message");
      socket.disconnect();
    };
  }, []);

  const fetchAll = () => {
    api
      .get("/admin/stats")
      .then((r) => setStats(r.data))
      .catch(() => {});
    api
      .get("/admin/users")
      .then((r) => setUsers(r.data))
      .catch(() => {});
    api
      .get("/admin/donations")
      .then((r) => setDonations(r.data))
      .catch(() => {});
    api
      .get("/admin/reports")
      .then((r) => setReports(r.data))
      .catch(() => {});
    api
      .get("/admin/conversations")
      .then((r) => setConversations(r.data))
      .catch(() => {});
    api
      .get("/admin/community")
      .then((r) => setCommunity(r.data))
      .catch(() => {});
    api
      .get("/admin/categories")
      .then((r) => setCategories(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(""), 3000);
  };

  const toggleUser = async (id) => {
    try {
      const res = await api.put(`/admin/users/${id}/toggle`);
      showMsg(res.data.msg);
      api.get("/admin/users").then((r) => setUsers(r.data));
    } catch {}
  };
  const deleteDonation = async (id) => {
    if (!window.confirm("Hapus donasi ini?")) return;
    try {
      await api.delete(`/admin/donations/${id}`);
      showMsg("Donasi dihapus");
      api.get("/admin/donations").then((r) => setDonations(r.data));
      api.get("/admin/stats").then((r) => setStats(r.data));
    } catch {}
  };
  const resolveReport = async (id, action) => {
    try {
      await api.put(`/admin/reports/${id}/${action}`);
      showMsg(`Laporan di-${action}`);
      api.get("/admin/reports").then((r) => setReports(r.data));
      api.get("/admin/stats").then((r) => setStats(r.data));
    } catch {}
  };
  const pinPost = async (id) => {
    try {
      const res = await api.put(`/admin/community/${id}/pin`);
      showMsg(res.data.msg);
      api.get("/admin/community").then((r) => setCommunity(r.data));
    } catch {}
  };
  const seedCategories = async () => {
    try {
      await api.post("/categories/seed");
      showMsg("Kategori default berhasil di-seed!");
      const res = await api.get("/admin/categories");
      setCategories(res.data);
    } catch (err) {
      console.error("Gagal seed kategori:", err);
      showMsg(
        err.response?.data?.msg || err.message || "Gagal seed kategori",
        "error",
      );
    }
  };
  const addCategory = async (e) => {
    e.preventDefault();
    try {
      await api.post("/categories", newCategory);
      showMsg("Kategori ditambahkan!");
      setNewCategory({ name: "", slug: "", icon_emoji: "" });
      api.get("/admin/categories").then((r) => setCategories(r.data));
    } catch (err) {
      showMsg(err.response?.data?.msg || "Gagal", "error");
    }
  };

  const ROLE_LABEL = {
    food_provider: "Provider",
    food_seeker: "Seeker",
    admin: "Admin",
  };
  const formatDate = (d) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  const formatDateTime = (d) =>
    new Date(d).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  const pendingReports = reports.filter((r) => r.status === "pending").length;

  const tabs = [
    { key: "stats", label: "Statistik", icon: "bi-bar-chart-line" },
    { key: "users", label: "Pengguna", icon: "bi-people" },
    { key: "donations", label: "Donasi", icon: "bi-box-seam" },
    {
      key: "reports",
      label: "Laporan",
      icon: "bi-flag",
      badge: pendingReports,
    },
    { key: "conversations", label: "Chat", icon: "bi-chat-dots" },
    { key: "community", label: "Komunitas", icon: "bi-globe2" },
    { key: "categories", label: "Kategori", icon: "bi-tags" },
  ];

  const statCards = stats
    ? [
        {
          label: "Total Pengguna",
          value: stats.totalUsers,
          icon: "bi-people-fill",
          accent: "#5f8b4c",
        },
        {
          label: "Food Provider",
          value: stats.totalProviders,
          icon: "bi-basket2-fill",
          accent: "#c8900a",
        },
        {
          label: "Food Seeker",
          value: stats.totalSeekers,
          icon: "bi-person-fill",
          accent: "#1e7ab8",
        },
        {
          label: "Total Donasi",
          value: stats.totalDonations,
          icon: "bi-gift-fill",
          accent: "#5f8b4c",
        },
        {
          label: "Donasi Tersedia",
          value: stats.availableDonations,
          icon: "bi-check-circle-fill",
          accent: "#7aaf60",
        },
        {
          label: "Donasi Selesai",
          value: stats.completedDonations,
          icon: "bi-trophy-fill",
          accent: "#c8900a",
        },
        {
          label: "Total Klaim",
          value: stats.totalClaims,
          icon: "bi-hand-index-fill",
          accent: "#1e7ab8",
        },
        {
          label: "Laporan Pending",
          value: stats.pendingReports,
          icon: "bi-flag-fill",
          accent: "#e05050",
        },
        {
          label: "Post Komunitas",
          value: stats.totalPosts,
          icon: "bi-chat-square-dots-fill",
          accent: "#5f8b4c",
        },
      ]
    : [];

  const statusBadge = (status) => {
    const map = {
      available: { cls: "adm-badge-green", label: "Tersedia" },
      partially_claimed: { cls: "adm-badge-blue", label: "Sebagian" },
      fully_claimed: { cls: "adm-badge-yellow", label: "Penuh" },
      completed: { cls: "adm-badge-gray", label: "Selesai" },
      cancelled: { cls: "adm-badge-red", label: "Batal" },
      pending: { cls: "adm-badge-yellow", label: "Pending" },
      resolved: { cls: "adm-badge-green", label: "Resolved" },
      dismissed: { cls: "adm-badge-gray", label: "Dismissed" },
    };
    const s = map[status] || { cls: "adm-badge-gray", label: status };
    return <span className={`adm-badge ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div
      className="adm-root outfit"
      style={{ background: "var(--bg)", minHeight: "100vh" }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "0 24px",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Title row */}
          <div
            style={{
              padding: "16px 0 12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,var(--g1),var(--g2))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 16px rgba(95,139,76,0.4)",
                }}
              >
                <i
                  className="bi bi-shield-check"
                  style={{ color: "#fff", fontSize: 16 }}
                />
              </div>
              <div>
                <h5
                  className="syne-h1"
                  style={{
                    fontSize: 16,
                    color: "var(--txt)",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  Admin Panel
                </h5>
                <p
                  style={{
                    fontSize: 10,
                    color: "var(--txt4)",
                    margin: 0,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  FoodRescue Control Center
                </p>
              </div>
            </div>

            {/* Live indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--g2)",
                  animation: "admin-pulse 2s ease infinite",
                  boxShadow: "0 0 6px var(--g2)",
                }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "var(--txt4)",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                }}
              >
                LIVE
              </span>
              <button
                className="adm-btn"
                onClick={fetchAll}
                style={{ padding: "5px 12px", fontSize: 11 }}
              >
                <i className="bi bi-arrow-clockwise" /> Refresh
              </button>
            </div>
          </div>

          {/* Tab row */}
          <div
            style={{
              display: "flex",
              gap: 2,
              overflowX: "auto",
              paddingBottom: 1,
            }}
          >
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`adm-tab ${tab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                <i className={`bi ${t.icon} me-1`} />
                {t.label}
                {t.badge > 0 && (
                  <span
                    style={{
                      marginLeft: 5,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      background: "#e05050",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 800,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0 4px",
                    }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {msg && (
        <div
          style={{
            position: "fixed",
            top: 80,
            right: 20,
            zIndex: 9999,
            background:
              msg.type === "error"
                ? "rgba(224,80,80,0.12)"
                : "rgba(95,139,76,0.12)",
            border: `1px solid ${msg.type === "error" ? "rgba(224,80,80,0.3)" : "rgba(95,139,76,0.3)"}`,
            borderRadius: 12,
            padding: "12px 18px",
            color: msg.type === "error" ? "#e05050" : "var(--g1)",
            fontSize: 13,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "var(--shadow2)",
            animation: "admin-fade 0.25s ease both",
            backdropFilter: "blur(12px)",
          }}
        >
          <i
            className={`bi ${msg.type === "error" ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`}
          />
          {msg.text}
        </div>
      )}

      {/* ── Content ── */}
      <div
        style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 60px" }}
      >
        {/* STATS */}
        {tab === "stats" && stats && (
          <div className="adm-section">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 14,
              }}
            >
              {statCards.map((s, i) => (
                <div key={i} className="adm-stat-card">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: `${s.accent}18`,
                        border: `1px solid ${s.accent}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className={`bi ${s.icon}`}
                        style={{ fontSize: 16, color: s.accent }}
                      />
                    </div>
                    <i
                      className="bi bi-arrow-up-right"
                      style={{ fontSize: 11, color: "var(--txt4)" }}
                    />
                  </div>
                  <p
                    className="syne-h1"
                    style={{
                      fontSize: 28,
                      color: "var(--txt)",
                      margin: "0 0 4px",
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </p>
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--txt4)",
                      margin: 0,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {s.label}
                  </p>
                  {/* accent line bottom */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 16,
                      right: 16,
                      height: 2,
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${s.accent}, transparent)`,
                      opacity: 0.5,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab === "users" && (
          <div className="adm-section">
            <div style={{ overflowX: "auto" }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    {[
                      "Pengguna",
                      "Email",
                      "Role",
                      "Trust",
                      "Status",
                      "Bergabung",
                      "Aksi",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 13,
                            color: "var(--txt)",
                          }}
                        >
                          {u.first_name} {u.last_name}
                        </div>
                        {u.username && (
                          <div style={{ fontSize: 11, color: "var(--txt4)" }}>
                            @{u.username}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                        {u.email}
                      </td>
                      <td>
                        <span className="adm-badge adm-badge-green">
                          {ROLE_LABEL[u.role] || u.role}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <i
                            className="bi bi-star-fill"
                            style={{ fontSize: 10, color: "var(--g2)" }}
                          />
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 700,
                              color: "var(--txt)",
                            }}
                          >
                            {u.trust_score?.toFixed(1) || "5.0"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`adm-badge ${u.is_active ? "adm-badge-green" : "adm-badge-red"}`}
                        >
                          {u.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                        {formatDate(u.created_at)}
                      </td>
                      <td>
                        <button
                          className={`adm-btn ${u.is_active ? "adm-btn-danger" : "adm-btn-success"}`}
                          style={{ fontSize: 11, padding: "5px 10px" }}
                          onClick={() => toggleUser(u._id)}
                        >
                          <i
                            className={`bi ${u.is_active ? "bi-slash-circle" : "bi-check-circle"}`}
                          />
                          {u.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <div className="adm-empty">
                  <i className="bi bi-people" />
                  Belum ada pengguna
                </div>
              )}
            </div>
          </div>
        )}

        {/* DONATIONS */}
        {tab === "donations" && (
          <div className="adm-section" style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  {[
                    "Judul",
                    "Provider",
                    "Kota",
                    "Stok",
                    "Status",
                    "Tanggal",
                    "Aksi",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td style={{ fontWeight: 700 }}>
                      {d.category_id?.icon_emoji} {d.title}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {d.provider_id?.first_name} {d.provider_id?.last_name}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {d.pickup_city}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <span style={{ fontWeight: 700, color: "var(--g1)" }}>
                        {d.quantity_remaining}
                      </span>
                      <span style={{ color: "var(--txt4)" }}>
                        /{d.quantity} {d.quantity_unit}
                      </span>
                    </td>
                    <td>{statusBadge(d.status)}</td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {formatDate(d.created_at)}
                    </td>
                    <td>
                      <button
                        className="adm-btn adm-btn-danger"
                        style={{ fontSize: 11, padding: "5px 10px" }}
                        onClick={() => deleteDonation(d._id)}
                      >
                        <i className="bi bi-trash" /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {donations.length === 0 && (
              <div className="adm-empty">
                <i className="bi bi-box-seam" />
                Belum ada donasi
              </div>
            )}
          </div>
        )}

        {/* REPORTS */}
        {tab === "reports" && (
          <div className="adm-section" style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  {[
                    "Pelapor",
                    "Tipe",
                    "Alasan",
                    "Deskripsi",
                    "Status",
                    "Tanggal",
                    "Aksi",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 700, fontSize: 13 }}>
                      {r.reporter_id?.first_name} {r.reporter_id?.last_name}
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-gray">
                        {r.reportable_type}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {r.reason?.replace("_", " ")}
                    </td>
                    <td
                      style={{
                        fontSize: 12,
                        color: "var(--txt3)",
                        maxWidth: 160,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.description || "-"}
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {formatDate(r.created_at)}
                    </td>
                    <td>
                      {r.status === "pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="adm-btn adm-btn-success"
                            style={{ fontSize: 11, padding: "5px 10px" }}
                            onClick={() => resolveReport(r._id, "resolve")}
                          >
                            <i className="bi bi-check2" /> Resolve
                          </button>
                          <button
                            className="adm-btn"
                            style={{ fontSize: 11, padding: "5px 10px" }}
                            onClick={() => resolveReport(r._id, "dismiss")}
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reports.length === 0 && (
              <div className="adm-empty">
                <i className="bi bi-flag" />
                Belum ada laporan
              </div>
            )}
          </div>
        )}

        {/* CONVERSATIONS */}
        {tab === "conversations" && (
          <div className="adm-section" style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  {["Donasi", "Provider", "Seeker", "Pesan", "Terakhir"].map(
                    (h) => (
                      <th key={h}>{h}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {conversations.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 700, fontSize: 13 }}>
                      {c.donation_id?.title || "-"}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {c.provider_id?.first_name} {c.provider_id?.last_name}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {c.seeker_id?.first_name} {c.seeker_id?.last_name}
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-blue">
                        {c.messages?.length || 0} pesan
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {c.last_message_at
                        ? formatDateTime(c.last_message_at)
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {conversations.length === 0 && (
              <div className="adm-empty">
                <i className="bi bi-chat-dots" />
                Belum ada percakapan
              </div>
            )}
          </div>
        )}

        {/* COMMUNITY */}
        {tab === "community" && (
          <div className="adm-section" style={{ overflowX: "auto" }}>
            <table className="adm-table">
              <thead>
                <tr>
                  {[
                    "Judul",
                    "Penulis",
                    "Tipe",
                    "Like",
                    "Komentar",
                    "Pin",
                    "Tanggal",
                    "Aksi",
                  ].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {community.map((p) => (
                  <tr key={p._id}>
                    <td
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.title}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {p.author_id?.first_name} {p.author_id?.last_name}
                    </td>
                    <td>
                      <span className="adm-badge adm-badge-green">
                        {p.type}
                      </span>
                    </td>
                    <td
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--txt)",
                      }}
                    >
                      {p.like_count}
                    </td>
                    <td
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--txt)",
                      }}
                    >
                      {p.comment_count}
                    </td>
                    <td>
                      {p.is_pinned ? (
                        <span className="adm-badge adm-badge-yellow">
                          📌 Pinned
                        </span>
                      ) : (
                        <span style={{ color: "var(--txt4)", fontSize: 12 }}>
                          —
                        </span>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--txt3)" }}>
                      {formatDate(p.created_at)}
                    </td>
                    <td>
                      <button
                        className={`adm-btn ${p.is_pinned ? "adm-btn-danger" : ""}`}
                        style={{ fontSize: 11, padding: "5px 10px" }}
                        onClick={() => pinPost(p._id)}
                      >
                        <i
                          className={`bi ${p.is_pinned ? "bi-pin-angle" : "bi-pin"}`}
                        />
                        {p.is_pinned ? "Unpin" : "Pin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {community.length === 0 && (
              <div className="adm-empty">
                <i className="bi bi-globe2" />
                Belum ada post
              </div>
            )}
          </div>
        )}

        {/* CATEGORIES */}
        {tab === "categories" && (
          <div className="adm-section">
            {/* Add form */}
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 20,
                boxShadow: "var(--shadow)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <h6
                  className="syne-h1"
                  style={{ fontSize: 13, color: "var(--txt)", margin: 0 }}
                >
                  ➕ Tambah Kategori Baru
                </h6>
                <button
                  className="adm-btn"
                  onClick={seedCategories}
                  style={{ fontSize: 11 }}
                >
                  <i className="bi bi-database" /> Seed Default
                </button>
              </div>
              <form onSubmit={addCategory}>
                <div
                  className="adm-form-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 120px 100px",
                    gap: 10,
                  }}
                >
                  <input
                    className="adm-input"
                    placeholder="Nama kategori"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    required
                  />
                  <input
                    className="adm-input"
                    placeholder="Slug (cth: makanan-siap-saji)"
                    value={newCategory.slug}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, slug: e.target.value })
                    }
                    required
                  />
                  <input
                    className="adm-input"
                    placeholder="Emoji 🍚"
                    value={newCategory.icon_emoji}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        icon_emoji: e.target.value,
                      })
                    }
                  />
                  <button
                    type="submit"
                    className="adm-btn adm-btn-primary"
                    style={{ padding: "9px 14px" }}
                  >
                    <i className="bi bi-plus-lg" /> Tambah
                  </button>
                </div>
              </form>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto" }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    {["Emoji", "Nama", "Slug", "Status"].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c._id}>
                      <td style={{ fontSize: 22 }}>{c.icon_emoji}</td>
                      <td style={{ fontWeight: 700 }}>{c.name}</td>
                      <td
                        style={{
                          fontSize: 12,
                          color: "var(--txt3)",
                          fontFamily: "monospace",
                        }}
                      >
                        {c.slug}
                      </td>
                      <td>
                        <span
                          className={`adm-badge ${c.is_active ? "adm-badge-green" : "adm-badge-gray"}`}
                        >
                          {c.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {categories.length === 0 && (
                <div className="adm-empty">
                  <i className="bi bi-tags" />
                  Belum ada kategori. Klik "Seed Default" untuk mulai.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
