import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../Context/AuthContext";

const TYPE_CONFIG = {
  tips: {
    label: "💡 Tips",
    color: "var(--g2)",
    bg: "rgba(95,139,76,0.12)",
    border: "rgba(95,139,76,0.3)",
  },
  success_story: {
    label: "🌟 Kisah Sukses",
    color: "#e8b84b",
    bg: "rgba(232,184,75,0.12)",
    border: "rgba(232,184,75,0.3)",
  },
  question: {
    label: "❓ Pertanyaan",
    color: "#4eb8d4",
    bg: "rgba(78,184,212,0.1)",
    border: "rgba(78,184,212,0.3)",
  },
  discussion: {
    label: "💬 Diskusi",
    color: "var(--txt3)",
    bg: "rgba(0,0,0,0.06)",
    border: "var(--border)",
  },
  announcement: {
    label: "📢 Pengumuman",
    color: "#e05050",
    bg: "rgba(224,80,80,0.1)",
    border: "rgba(224,80,80,0.3)",
  },
};

const TABS = [
  { key: "all", icon: "bi-grid", label: "Semua" },
  { key: "tips", icon: "bi-lightbulb", label: "Tips" },
  { key: "success_story", icon: "bi-star", label: "Kisah" },
  { key: "question", icon: "bi-question-circle", label: "Tanya" },
  { key: "discussion", icon: "bi-chat-dots", label: "Diskusi" },
];

function TypeBadge({ type }) {
  const t = TYPE_CONFIG[type] || TYPE_CONFIG.discussion;
  return (
    <span
      style={{
        background: t.bg,
        color: t.color,
        border: `1px solid ${t.border}`,
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 9px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        whiteSpace: "nowrap",
        fontFamily: "inherit",
      }}
    >
      {t.label}
    </span>
  );
}

function Avatar({ name, size = 34, bg = "var(--g1)" }) {
  const initials = name ? name[0].toUpperCase() : "?";
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: bg,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.38,
        fontWeight: 700,
      }}
    >
      {initials}
    </div>
  );
}

function StatPill({ icon, value }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 11,
        color: "var(--txt4)",
      }}
    >
      <i className={`bi ${icon}`} style={{ fontSize: 11 }} />
      {value}
    </span>
  );
}

function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [activePost, setActivePost] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    type: "discussion",
    title: "",
    content: "",
    tags: "",
  });

  const userId = user?.id || user?._id;

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab !== "all") params.append("type", tab);
      const res = await api.get(`/community?${params.toString()}`);
      setPosts(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    try {
      await api.post("/community", {
        ...form,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      setMsg("success");
      setShowForm(false);
      setForm({ type: "discussion", title: "", content: "", tags: "" });
      fetchPosts();
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setMsg("error:" + (err.response?.data?.msg || "Gagal membuat post"));
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/community/${postId}/like`);
      fetchPosts();
      if (activePost?._id === postId) {
        const res = await api.get(`/community/${postId}?noview=1`);
        setActivePost(res.data);
      }
    } catch {}
  };

  const handleOpenPost = async (post) => {
    try {
      const res = await api.get(`/community/${post._id}`);
      setActivePost(res.data);
      fetchPosts();
    } catch {}
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await api.post(`/community/${activePost._id}/comments`, {
        content: commentText,
      });
      setCommentText("");
      const res = await api.get(`/community/${activePost._id}?noview=1`);
      setActivePost(res.data);
      fetchPosts();
    } catch {}
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Hapus post ini?")) return;
    try {
      await api.delete(`/community/${postId}`);
      setActivePost(null);
      fetchPosts();
    } catch {}
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

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

  return (
    <div
      className="outfit"
      style={{ background: "var(--bg)", minHeight: "100vh" }}
    >
      {/* Header */}
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
              className="bi-people"
              style={{
                fontSize: 35,
                color: "var(--g1)",
                lineHeight: 1,
              }}
            />

            <h4
              className="syne-h1 mb-0"
              style={{
                color: "var(--txt)",
                fontSize: 22,
                lineHeight: 1,
              }}
            >
              Komunitas
            </h4>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                background: "rgba(95,139,76,0.12)",
                border: "1px solid rgba(95,139,76,0.3)",
                borderRadius: 12,
                padding: "8px 14px",
                display: "flex",
                alignItems: "center",
                gap: 7,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--g2)",
                  display: "inline-block",
                }}
              />
              <span
                style={{ color: "var(--g2)", fontSize: 12, fontWeight: 600 }}
              >
                {posts.length} post
              </span>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "9px 16px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: showForm ? "rgba(224,80,80,0.12)" : "var(--g1)",
                color: showForm ? "#e05050" : "#fff",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
            >
              <i
                className={`bi ${showForm ? "bi-x" : "bi-plus"}`}
                style={{ fontSize: 16 }}
              />
              {showForm ? "Batal" : "Buat Post"}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 20px" }}>
        {/* Toast message */}
        {msg === "success" && (
          <div
            style={{
              background: "rgba(95,139,76,0.12)",
              border: "1px solid rgba(95,139,76,0.3)",
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 16,
              color: "var(--g2)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ✅ Post berhasil dibuat!
          </div>
        )}
        {msg.startsWith("error:") && (
          <div
            style={{
              background: "rgba(224,80,80,0.1)",
              border: "1px solid rgba(224,80,80,0.3)",
              borderRadius: 10,
              padding: "10px 16px",
              marginBottom: 16,
              color: "#e05050",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            ❌ {msg.replace("error:", "")}
          </div>
        )}

        {/* Create Post Form */}
        {showForm && (
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "20px",
              marginBottom: 20,
              boxShadow: "var(--shadow2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
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
                  className="bi bi-pencil"
                  style={{ color: "var(--g2)", fontSize: 13 }}
                />
              </div>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--txt)",
                  letterSpacing: "0.02em",
                }}
              >
                Buat Post Baru
              </span>
            </div>

            <div
              className="community-form-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <select
                className="input-green"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                style={{ ...inputStyle }}
              >
                {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
              <input
                className="input-green"
                type="text"
                placeholder="Judul post kamu..."
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={{ ...inputStyle }}
              />
            </div>

            <textarea
              className="input-green"
              rows={4}
              placeholder="Tulis konten post kamu..."
              required
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
            />

            <div
              className="community-form-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <input
                className="input-green"
                type="text"
                placeholder="Tags: tips, makanan, donasi (pisah koma)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                style={{ ...inputStyle }}
              />
              <button
                onClick={handleSubmitPost}
                style={{
                  padding: "9px 20px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: "var(--g1)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  whiteSpace: "nowrap",
                }}
              >
                <i className="bi bi-send" style={{ fontSize: 13 }} /> Post
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 18,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setActivePost(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 16px",
                borderRadius: 10,
                border: "1px solid",
                borderColor: tab === t.key ? "var(--g2)" : "var(--border)",
                background:
                  tab === t.key ? "rgba(95,139,76,0.1)" : "var(--surface)",
                color: tab === t.key ? "var(--g1)" : "var(--txt3)",
                fontSize: 12,
                fontWeight: tab === t.key ? 700 : 500,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <i className={`bi ${t.icon}`} style={{ fontSize: 13 }} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          className="community-content-grid"
          style={{
            display: "grid",
            gridTemplateColumns: activePost ? "1fr 1fr" : "1fr",
            gap: 16,
            alignItems: "start",
          }}
        >
          {/* Post List */}
          <div
            className={`community-post-list${activePost ? " community-pane-hidden-mobile" : ""}`}
          >
            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "60px 0",
                  gap: 14,
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
                  Memuat post...
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 24px",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
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
                  💬
                </div>
                <p
                  className="syne-h1"
                  style={{ fontSize: 15, color: "var(--txt)", marginBottom: 6 }}
                >
                  Belum ada post
                </p>
                <p style={{ fontSize: 12, color: "var(--txt4)" }}>
                  Jadilah yang pertama berbagi!
                </p>
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {posts.map((p) => {
                  const isActive = activePost?._id === p._id;
                  return (
                    <div
                      key={p._id}
                      onClick={() => handleOpenPost(p)}
                      style={{
                        background: "var(--surface)",
                        border: `1px solid ${isActive ? "var(--g2)" : "var(--border)"}`,
                        borderLeft: `3px solid ${isActive ? "var(--g1)" : "transparent"}`,
                        borderRadius: 14,
                        padding: "14px 16px",
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "var(--shadow2)"
                          : "var(--shadow)",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "var(--g3)";
                          e.currentTarget.style.boxShadow = "var(--shadow2)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.boxShadow = "var(--shadow)";
                        }
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 7,
                          }}
                        >
                          {p.is_pinned && (
                            <i
                              className="bi bi-pin-fill"
                              style={{ color: "#e05050", fontSize: 12 }}
                            />
                          )}
                          <TypeBadge type={p.type} />
                        </div>
                        <small style={{ fontSize: 10, color: "var(--txt4)" }}>
                          {formatDate(p.created_at)}
                        </small>
                      </div>

                      <h6
                        className="syne-h1"
                        style={{
                          fontSize: 13,
                          color: "var(--txt)",
                          marginBottom: 5,
                          lineHeight: 1.35,
                        }}
                      >
                        {p.title}
                      </h6>
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--txt3)",
                          marginBottom: 10,
                          lineHeight: 1.6,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {p.content}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Avatar
                            name={p.author_id?.first_name}
                            size={22}
                            bg="var(--g3)"
                          />
                          <span style={{ fontSize: 11, color: "var(--txt4)" }}>
                            {p.author_id?.first_name} {p.author_id?.last_name}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <StatPill icon="bi-heart" value={p.like_count} />
                          <StatPill icon="bi-chat" value={p.comment_count} />
                          <StatPill icon="bi-eye" value={p.view_count} />
                        </div>
                      </div>

                      {p.tags?.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            gap: 5,
                            flexWrap: "wrap",
                            marginTop: 8,
                          }}
                        >
                          {p.tags.slice(0, 3).map((t, i) => (
                            <span
                              key={i}
                              style={{
                                background: "var(--g5)",
                                color: "var(--txt4)",
                                border: "1px solid var(--border)",
                                borderRadius: 20,
                                fontSize: 10,
                                padding: "1px 8px",
                              }}
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          {activePost && (
            <div
              className="community-detail-panel"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 16,
                boxShadow: "var(--shadow2)",
                position: "sticky",
                top: 16,
                maxHeight: "calc(100vh - 160px)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Detail Header */}
              <div
                style={{
                  padding: "14px 16px",
                  borderBottom: "1px solid var(--border)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <TypeBadge type={activePost.type} />
                <div style={{ display: "flex", gap: 8 }}>
                  {(activePost.author_id?._id === userId ||
                    activePost.author_id === userId) && (
                    <button
                      onClick={() => handleDeletePost(activePost._id)}
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        border: "1px solid rgba(224,80,80,0.3)",
                        background: "rgba(224,80,80,0.08)",
                        color: "#e05050",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="bi bi-trash" style={{ fontSize: 13 }} />
                    </button>
                  )}
                  <button
                    onClick={() => setActivePost(null)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      background: "var(--surf2)",
                      color: "var(--txt3)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i className="bi bi-x" style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>

              {/* Scrollable body */}
              <div style={{ overflowY: "auto", flex: 1, padding: "16px 18px" }}>
                <h5
                  className="syne-h1"
                  style={{
                    fontSize: 16,
                    color: "var(--txt)",
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {activePost.title}
                </h5>

                {/* Author row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 14,
                    padding: "10px 12px",
                    background: "var(--g5)",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                  }}
                >
                  <Avatar name={activePost.author_id?.first_name} size={32} />
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--txt)",
                      }}
                    >
                      {activePost.author_id?.first_name}{" "}
                      {activePost.author_id?.last_name}
                    </p>
                    <p
                      style={{ margin: 0, fontSize: 11, color: "var(--txt4)" }}
                    >
                      {activePost.author_id?.role === "food_provider"
                        ? "🍱 Provider"
                        : "🤲 Seeker"}{" "}
                      · {formatDate(activePost.created_at)}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <StatPill icon="bi-eye" value={activePost.view_count} />
                  </div>
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "var(--txt2)",
                    lineHeight: 1.8,
                    marginBottom: 14,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {activePost.content}
                </p>

                {activePost.tags?.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      flexWrap: "wrap",
                      marginBottom: 14,
                    }}
                  >
                    {activePost.tags.map((t, i) => (
                      <span
                        key={i}
                        style={{
                          background: "var(--g5)",
                          color: "var(--txt3)",
                          border: "1px solid var(--border)",
                          borderRadius: 20,
                          fontSize: 11,
                          padding: "2px 10px",
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Like button */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 18,
                    paddingBottom: 16,
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <button
                    onClick={() => handleLike(activePost._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "7px 16px",
                      borderRadius: 10,
                      border: "1px solid",
                      borderColor: activePost.liked_by?.includes(userId)
                        ? "rgba(224,80,80,0.4)"
                        : "var(--border)",
                      background: activePost.liked_by?.includes(userId)
                        ? "rgba(224,80,80,0.1)"
                        : "var(--surf2)",
                      color: activePost.liked_by?.includes(userId)
                        ? "#e05050"
                        : "var(--txt3)",
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <i
                      className={`bi ${activePost.liked_by?.includes(userId) ? "bi-heart-fill" : "bi-heart"}`}
                    />
                    {activePost.like_count}
                  </button>
                  <span style={{ fontSize: 12, color: "var(--txt4)" }}>
                    <i className="bi bi-chat me-1" />
                    {activePost.comment_count} komentar
                  </span>
                </div>

                {/* Comments */}
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--txt4)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                  }}
                >
                  Komentar ({activePost.comment_count})
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {activePost.comments
                    ?.filter((c) => !c.is_deleted)
                    .map((c) => (
                      <div key={c._id} style={{ display: "flex", gap: 10 }}>
                        <Avatar
                          name={c.author_id?.first_name}
                          size={30}
                          bg="var(--g5)"
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              background: "var(--g5)",
                              border: "1px solid var(--border)",
                              borderRadius: "4px 12px 12px 12px",
                              padding: "8px 12px",
                            }}
                          >
                            <p
                              style={{
                                margin: 0,
                                fontSize: 11,
                                fontWeight: 700,
                                color: "var(--txt2)",
                                marginBottom: 3,
                              }}
                            >
                              {c.author_id?.first_name} {c.author_id?.last_name}
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: 12,
                                color: "var(--txt3)",
                                lineHeight: 1.5,
                              }}
                            >
                              {c.content}
                            </p>
                          </div>
                          <small
                            style={{
                              fontSize: 10,
                              color: "var(--txt4)",
                              marginLeft: 4,
                            }}
                          >
                            {formatDate(c.created_at)}
                          </small>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Comment input — sticky bottom */}
              {user && (
                <div
                  style={{
                    padding: "12px 16px",
                    borderTop: "1px solid var(--border)",
                    flexShrink: 0,
                    background: "var(--surface)",
                  }}
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
                  >
                    <Avatar name={user.first_name} size={30} />
                    <textarea
                      className="input-green"
                      placeholder="Tulis komentar..."
                      value={commentText}
                      rows={1}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleComment(e);
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
                      onClick={handleComment}
                      disabled={!commentText.trim()}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        border: "none",
                        cursor: commentText.trim() ? "pointer" : "not-allowed",
                        background: commentText.trim()
                          ? "var(--g1)"
                          : "var(--g5)",
                        color: commentText.trim() ? "#fff" : "var(--txt4)",
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Community;
