import { useState, useEffect, useRef } from "react";
import api from "../utils/api";
import { useAuth } from "../Context/AuthContext";
import socket from "../utils/socket";

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevConvIdRef = useRef(null);
  const prevMsgCountRef = useRef(0);

  const scrollToBottom = (behavior = "smooth") => {
    const el = messagesContainerRef.current;
    if (el)
      el.scrollTop = behavior === "instant" ? el.scrollHeight : el.scrollHeight;
  };

  const userId = user?.id || user?._id;

  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const fetchActive = async (id) => {
    try {
      const res = await api.get(`/conversations/${id}`);
      setActive(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => {
      // Kalau ada conversation aktif saat reconnect, join lagi
      if (active?._id) {
        socket.emit("join_conversation", active._id);
      }
    });

    socket.on("new_message", (newMsg) => {
      setActive((prev) => {
        if (!prev) return prev;
        const exists = prev.messages.some((m) => m._id === newMsg._id);
        if (exists) return prev;
        return { ...prev, messages: [...prev.messages, newMsg] };
      });
      fetchConversations();
    });

    return () => {
      socket.off("new_message");
      socket.off("connect");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const msgCount = active.messages?.length || 0;
    const isSameConv = prevConvIdRef.current === active._id;

    if (!isSameConv) {
      // Ganti conversation — langsung ke bawah tanpa animasi halaman
      setTimeout(() => scrollToBottom("instant"), 0);
    } else if (isSameConv && msgCount > prevMsgCountRef.current) {
      // Pesan baru — scroll smooth di dalam container
      scrollToBottom("smooth");
    }

    prevConvIdRef.current = active._id;
    prevMsgCountRef.current = msgCount;
  }, [active?._id, active?.messages?.length]);

  const handleSelect = (conv) => {
    socket.emit("join_conversation", conv._id);
    fetchActive(conv._id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!chatMsg.trim() || !active) return;
    try {
      await api.post(`/conversations/${active._id}/messages`, {
        content: chatMsg,
      });
      setChatMsg("");
      fetchActive(active._id);
    } catch {}
  };

  const getOtherUser = (conv) => {
    if (!conv) return null;
    const isProvider =
      conv.provider_id?._id === userId || conv.provider_id === userId;
    return isProvider ? conv.seeker_id : conv.provider_id;
  };

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return formatTime(date);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const getInitials = (user) => {
    if (!user) return "?";
    return (
      `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() ||
      "?"
    );
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
          Memuat pesan...
        </p>
      </div>
    );

  const otherActive = getOtherUser(active);

  return (
    <div
      className="outfit"
      style={{
        background: "var(--bg)",
        height: "calc(100vh - 54px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "var(--surf2)",
          borderBottom: "1px solid var(--border)",
          padding: "16px 24px",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
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
              className="bi-chat-dots"
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
              Pesan
            </h4>
          </div>
          <div
            style={{
              background: "rgba(95,139,76,0.12)",
              border: "1px solid rgba(95,139,76,0.3)",
              borderRadius: 12,
              padding: "6px 14px",
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
            <span style={{ color: "var(--g2)", fontSize: 12, fontWeight: 600 }}>
              {conversations.length} percakapan
            </span>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* ── Sidebar ── */}
        <div
          style={{
            width: 300,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            background: "var(--surface)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {conversations.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                padding: 32,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: "var(--g5)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 14,
                }}
              >
                <i
                  className="bi bi-chat-square"
                  style={{ fontSize: 22, color: "var(--txt4)" }}
                />
              </div>
              <p
                className="syne-h1"
                style={{ fontSize: 13, color: "var(--txt)", marginBottom: 4 }}
              >
                Belum ada percakapan
              </p>
              <p style={{ fontSize: 12, color: "var(--txt4)" }}>
                Mulai dari halaman donasi
              </p>
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherUser(conv);
              const isActiveCon = active?._id === conv._id;
              const lastMsg = conv.messages?.[conv.messages.length - 1];
              const isProvider =
                conv.provider_id?._id === userId || conv.provider_id === userId;
              const unread = isProvider
                ? conv.provider_unread
                : conv.seeker_unread;

              return (
                <div
                  key={conv._id}
                  onClick={() => handleSelect(conv)}
                  style={{
                    padding: "12px 14px",
                    cursor: "pointer",
                    borderBottom: "1px solid var(--border)",
                    background: isActiveCon ? "var(--g5)" : "transparent",
                    borderLeft: isActiveCon
                      ? "3px solid var(--g1)"
                      : "3px solid transparent",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActiveCon)
                      e.currentTarget.style.background = "var(--surf2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActiveCon)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        flexShrink: 0,
                        background: isActiveCon ? "var(--g1)" : "var(--g5)",
                        border: `1px solid ${isActiveCon ? "var(--g2)" : "var(--border)"}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: isActiveCon ? "#fff" : "var(--txt3)",
                      }}
                    >
                      {getInitials(other)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 3,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--txt)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 140,
                          }}
                        >
                          {other?.first_name} {other?.last_name}
                        </span>
                        <small
                          style={{
                            fontSize: 10,
                            color: "var(--txt4)",
                            flexShrink: 0,
                          }}
                        >
                          {conv.last_message_at &&
                            formatDate(conv.last_message_at)}
                        </small>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <small
                          style={{
                            fontSize: 11,
                            color: "var(--txt4)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 160,
                          }}
                        >
                          {conv.donation_id?.title ? (
                            <>
                              <i className="bi bi-basket2 me-1" />
                              {conv.donation_id.title}
                            </>
                          ) : (
                            lastMsg?.content || "Mulai percakapan"
                          )}
                        </small>
                        {unread > 0 && (
                          <span
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: "50%",
                              flexShrink: 0,
                              background: "var(--g1)",
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── Chat Area ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            background: "var(--bg)",
          }}
        >
          {!active ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 20,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow)",
                }}
              >
                <i
                  className="bi bi-chat-dots"
                  style={{ fontSize: 28, color: "var(--txt4)" }}
                />
              </div>
              <p
                className="syne-h1"
                style={{ fontSize: 15, color: "var(--txt3)" }}
              >
                Pilih percakapan
              </p>
              <p style={{ fontSize: 12, color: "var(--txt4)" }}>
                Pilih dari daftar di sebelah kiri untuk mulai chat
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div
                style={{
                  padding: "12px 18px",
                  flexShrink: 0,
                  background: "var(--surface)",
                  borderBottom: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: "var(--shadow)",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    flexShrink: 0,
                    background: "var(--g1)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  {getInitials(otherActive)}
                </div>
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "var(--txt)",
                    }}
                  >
                    {otherActive?.first_name} {otherActive?.last_name}
                  </p>
                  {active.donation_id && (
                    <p
                      style={{ margin: 0, fontSize: 11, color: "var(--txt4)" }}
                    >
                      <i className="bi bi-basket2 me-1" />
                      {active.donation_id.title}
                    </p>
                  )}
                </div>
                {/* Online indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--g2)",
                      display: "inline-block",
                    }}
                  />
                  <span style={{ fontSize: 11, color: "var(--txt4)" }}>
                    Online
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {active.messages?.length === 0 ? (
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 16,
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i
                        className="bi bi-chat"
                        style={{ fontSize: 22, color: "var(--txt4)" }}
                      />
                    </div>
                    <p style={{ fontSize: 12, color: "var(--txt4)" }}>
                      Belum ada pesan. Mulai percakapan!
                    </p>
                  </div>
                ) : (
                  active.messages.map((m, idx) => {
                    const isMe =
                      m.sender_id === userId || m.sender_id?._id === userId;
                    const prevMsg = active.messages[idx - 1];
                    const showDate =
                      !prevMsg ||
                      new Date(m.created_at).toDateString() !==
                        new Date(prevMsg.created_at).toDateString();

                    return (
                      <div key={m._id}>
                        {/* Date separator */}
                        {showDate && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              margin: "8px 0 12px",
                            }}
                          >
                            <div
                              style={{
                                flex: 1,
                                height: 1,
                                background: "var(--border)",
                              }}
                            />
                            <span
                              style={{
                                fontSize: 10,
                                color: "var(--txt4)",
                                fontWeight: 600,
                                letterSpacing: "0.05em",
                              }}
                            >
                              {new Date(m.created_at).toLocaleDateString(
                                "id-ID",
                                { day: "numeric", month: "long" },
                              )}
                            </span>
                            <div
                              style={{
                                flex: 1,
                                height: 1,
                                background: "var(--border)",
                              }}
                            />
                          </div>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: isMe ? "flex-end" : "flex-start",
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "68%",
                              padding: "9px 14px",
                              borderRadius: isMe
                                ? "14px 14px 4px 14px"
                                : "14px 14px 14px 4px",
                              background: isMe ? "var(--g1)" : "var(--surface)",
                              border: isMe ? "none" : "1px solid var(--border)",
                              color: isMe ? "#fff" : "var(--txt)",
                              fontSize: 13,
                              lineHeight: 1.5,
                              wordBreak: "break-word",
                              boxShadow: "var(--shadow)",
                            }}
                          >
                            {m.is_deleted_by_sender ? (
                              <em style={{ opacity: 0.6, fontSize: 12 }}>
                                Pesan dihapus
                              </em>
                            ) : (
                              m.content
                            )}
                          </div>
                          <small
                            style={{
                              fontSize: 10,
                              color: "var(--txt4)",
                              marginTop: 3,
                              marginLeft: 2,
                              marginRight: 2,
                            }}
                          >
                            {formatTime(m.created_at)}
                          </small>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div
                style={{
                  padding: "12px 16px",
                  flexShrink: 0,
                  background: "var(--surface)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div
                  style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
                >
                  <textarea
                    className="input-green"
                    placeholder="Tulis pesan... (Enter kirim, Shift+Enter baris baru)"
                    value={chatMsg}
                    rows={1}
                    style={{
                      flex: 1,
                      resize: "none",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      padding: "10px 14px",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      background: "var(--g5)",
                    }}
                    onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!chatMsg.trim()}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      border: "none",
                      cursor: chatMsg.trim() ? "pointer" : "not-allowed",
                      background: chatMsg.trim() ? "var(--g1)" : "var(--g5)",
                      color: chatMsg.trim() ? "#fff" : "var(--txt4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.2s",
                      flexShrink: 0,
                    }}
                  >
                    <i className="bi bi-send" style={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
