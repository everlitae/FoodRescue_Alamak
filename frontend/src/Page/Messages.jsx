import { useState, useEffect, useRef, useCallback } from "react";
import api from "../utils/api";
import { useAuth } from "../Context/AuthContext";
import socket from "../utils/socket";

function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [chatMsg, setChatMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [otherOnline, setOtherOnline] = useState(false);

  const messagesContainerRef = useRef(null);
  const prevConvIdRef = useRef(null);
  const prevMsgCountRef = useRef(0);
  const activeRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const myTypingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const userId = user?.id || user?._id;

  // Sync activeRef
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const scrollToBottom = (behavior = "smooth") => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data);
    } catch {}
  }, []);

  const fetchActive = async (id) => {
    try {
      const res = await api.get(`/conversations/${id}`);
      setActive(res.data);
    } catch {}
  };

  // ── Cek status online lawan bicara ───────────────────────────────
  const checkOtherOnline = useCallback((conv) => {
    if (!conv || !socket.connected) return;
    const otherId = getOtherUserId(conv);
    if (!otherId) return;
    socket.emit("check_online", otherId, ({ status }) => {
      setOtherOnline(status === "online");
    });
  }, []);

  const getOtherUserId = (conv) => {
    if (!conv) return null;
    const provId =
      conv.provider_id?._id ||
      conv.provider_id?.toString?.() ||
      conv.provider_id;
    const seekId =
      conv.seeker_id?._id || conv.seeker_id?.toString?.() || conv.seeker_id;
    const provStr = provId?.toString?.() || provId;
    const seekStr = seekId?.toString?.() || seekId;
    return provStr === userId?.toString() ? seekStr : provStr;
  };

  // ── Mount: connect socket + setup semua listeners ─────────────────
  useEffect(() => {
    if (!userId) return;

    fetchConversations().finally(() => setLoading(false));

    if (!socket.connected) socket.connect();

    // Join personal room
    socket.emit("join_user", userId);

    // Pesan baru masuk
    socket.on("new_message", (newMsg) => {
      const cur = activeRef.current;
      if (cur?._id === newMsg.conversationId) {
        setActive((prev) => {
          if (!prev) return prev;
          const filtered = prev.messages.filter(
            (m) => !String(m._id).startsWith("temp_"),
          );
          const exists = filtered.some((m) => m._id === newMsg._id);
          if (exists) return { ...prev, messages: filtered };
          return { ...prev, messages: [...filtered, newMsg] };
        });
        setIsTyping(false);
      }
      fetchConversations();
    });

    // Badge navbar
    socket.on("new_message_notify", () => {
      fetchConversations();
    });

    // Typing dari lawan bicara
    socket.on("user_typing", ({ isTyping: typing }) => {
      setIsTyping(typing);
      if (typing) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 4000);
      } else {
        clearTimeout(typingTimeoutRef.current);
      }
    });

    // Presence update (online/offline) dari siapapun
    socket.on("presence_update", ({ userId: uid, status }) => {
      const cur = activeRef.current;
      if (!cur) return;
      const otherId = getOtherUserId(cur);
      if (uid?.toString() === otherId?.toString()) {
        setOtherOnline(status === "online");
      }
      // Update unread badge di sidebar juga kalau perlu
    });

    // Saat socket reconnect (misal balik dari halaman lain), join ulang user room
    const handleReconnect = () => {
      if (userId) socket.emit("join_user", userId);
      if (activeRef.current?._id) {
        socket.emit("join_conversation", activeRef.current._id);
      }
    };
    socket.on("connect", handleReconnect);

    return () => {
      socket.off("new_message");
      socket.off("new_message_notify");
      socket.off("user_typing");
      socket.off("presence_update");
      socket.off("connect", handleReconnect);
      clearTimeout(typingTimeoutRef.current);
      clearTimeout(myTypingTimeoutRef.current);
      // JANGAN disconnect — NavBar dan ToastNotification juga pakai socket yang sama
      // Cukup leave conversation yang sedang aktif
      if (activeRef.current?._id) {
        socket.emit("leave_conversation", activeRef.current._id);
      }
    };
  }, [userId]);

  // ── Ganti conversation: join room baru, cek online ────────────────
  useEffect(() => {
    if (!active?._id) return;

    if (prevConvIdRef.current && prevConvIdRef.current !== active._id) {
      socket.emit("leave_conversation", prevConvIdRef.current);
      // Stop typing di room lama
      socket.emit("typing_stop", {
        conversationId: prevConvIdRef.current,
        userId,
      });
    }

    socket.emit("join_conversation", active._id);
    setIsTyping(false);

    // Cek status online lawan bicara
    checkOtherOnline(active);
  }, [active?._id]);

  // ── Auto scroll ───────────────────────────────────────────────────
  useEffect(() => {
    if (!active) return;
    const msgCount = active.messages?.length || 0;
    const isSameConv = prevConvIdRef.current === active._id;

    if (!isSameConv) {
      setTimeout(() => scrollToBottom("instant"), 50);
    } else if (msgCount > prevMsgCountRef.current) {
      scrollToBottom("smooth");
    }

    prevConvIdRef.current = active._id;
    prevMsgCountRef.current = msgCount;
  }, [active?._id, active?.messages?.length]);

  const handleSelect = (conv) => {
    setOtherOnline(false); // reset dulu, tunggu check_online callback
    socket.emit("join_conversation", conv._id);
    socket.emit("mark_as_read", {
      conversationId: conv._id,
      userId
    });

    fetchActive(conv._id);
  };

  // ── Kirim pesan ───────────────────────────────────────────────────
  const handleSend = async (e) => {
    e?.preventDefault();
    if (!chatMsg.trim() || !active) return;
    const content = chatMsg.trim();
    setChatMsg("");

    // Stop typing
    if (isTypingRef.current) {
      socket.emit("typing_stop", { conversationId: active._id, userId });
      isTypingRef.current = false;
    }
    clearTimeout(myTypingTimeoutRef.current);

    // Optimistic update
    const tempId = "temp_" + Date.now();
    setActive((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        messages: [
          ...prev.messages,
          {
            _id: tempId,
            sender_id: userId,
            content,
            created_at: new Date().toISOString(),
            message_type: "text",
          },
        ],
      };
    });

    try {
      await api.post(`/conversations/${active._id}/messages`, { content });
    } catch {
      setActive((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          messages: prev.messages.filter((m) => m._id !== tempId),
        };
      });
      setChatMsg(content);
    }
  };

  // ── Typing handler ────────────────────────────────────────────────
  const handleTyping = (e) => {
    setChatMsg(e.target.value);
    if (!active) return;

    if (!isTypingRef.current) {
      socket.emit("typing_start", { conversationId: active._id, userId });
      isTypingRef.current = true;
    }

    clearTimeout(myTypingTimeoutRef.current);
    myTypingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { conversationId: active._id, userId });
      isTypingRef.current = false;
    }, 2000);
  };

  // ── Helpers ───────────────────────────────────────────────────────
  const getOtherUser = (conv) => {
    if (!conv) return null;
    const provId =
      conv.provider_id?._id?.toString?.() ||
      conv.provider_id?.toString?.() ||
      conv.provider_id;
    return provId === userId?.toString() ? conv.seeker_id : conv.provider_id;
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
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Kemarin";
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  };

  const formatHeaderDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return "Hari Ini";
    if (d.toDateString() === yesterday.toDateString()) return "Kemarin";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getInitials = (u) => {
    if (!u) return "?";
    return (
      `${u.first_name?.[0] || ""}${u.last_name?.[0] || ""}`.toUpperCase() || "?"
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
      {/* ── Header ── */}
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
              style={{ fontSize: 35, color: "var(--g1)", lineHeight: 1 }}
            />
            <h4
              className="syne-h1 mb-0"
              style={{ color: "var(--txt)", fontSize: 22, lineHeight: 1 }}
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

      {/* ── Main layout ── */}
      <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
        {/* ── SIDEBAR ── */}
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
                (conv.provider_id?._id || conv.provider_id)?.toString() ===
                userId?.toString();
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
                    <div style={{ position: "relative", flexShrink: 0 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
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
                        {other?.avatar_url ? (
                          <img
                            src={other.avatar_url}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: "50%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          getInitials(other)
                        )}
                      </div>
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
                            fontWeight: unread > 0 ? 700 : 600,
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
                            color: unread > 0 ? "var(--g1)" : "var(--txt4)",
                            fontWeight: unread > 0 ? 600 : 400,
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
                            color: unread > 0 ? "var(--txt2)" : "var(--txt4)",
                            fontWeight: unread > 0 ? 600 : 400,
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
                          ) : lastMsg ? (
                            lastMsg.is_deleted_by_sender ? (
                              <em style={{ opacity: 0.6 }}>Pesan dihapus</em>
                            ) : (
                              lastMsg.content
                            )
                          ) : (
                            "Mulai percakapan"
                          )}
                        </small>
                        {unread > 0 && (
                          <span
                            style={{
                              minWidth: 18,
                              height: 18,
                              borderRadius: 999,
                              flexShrink: 0,
                              background: "var(--g1)",
                              color: "#fff",
                              fontSize: 10,
                              fontWeight: 700,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0 5px",
                            }}
                          >
                            {unread > 99 ? "99+" : unread}
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

        {/* ── CHAT AREA ── */}
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
              {/* ── Chat Header ── */}
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
                {/* Avatar */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "var(--g1)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 14,
                      fontWeight: 700,
                      overflow: "hidden",
                    }}
                  >
                    {otherActive?.avatar_url ? (
                      <img
                        src={otherActive.avatar_url}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      getInitials(otherActive)
                    )}
                  </div>
                  {/* Online dot */}
                  <span
                    style={{
                      position: "absolute",
                      bottom: 1,
                      right: 1,
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: otherOnline ? "#22c55e" : "#9ca3af",
                      border: "2px solid var(--surface)",
                      transition: "background 0.3s",
                    }}
                  />
                </div>

                {/* Nama + status */}
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
                  <p
                    style={{
                      margin: 0,
                      fontSize: 11,
                      color: isTyping
                        ? "var(--g1)"
                        : otherOnline
                          ? "#22c55e"
                          : "var(--txt4)",
                    }}
                  >
                    {isTyping
                      ? "sedang mengetik..."
                      : otherOnline
                        ? "Online"
                        : "Offline"}
                  </p>
                </div>

                {/* Donation tag */}
                {active.donation_id && (
                  <div
                    style={{
                      background: "var(--g5)",
                      border: "1px solid var(--g3)",
                      borderRadius: 8,
                      padding: "4px 10px",
                      fontSize: 11,
                      color: "var(--g1)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <i className="bi bi-basket2" />
                    <span
                      style={{
                        maxWidth: 140,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {active.donation_id.title}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Messages ── */}
              <div
                ref={messagesContainerRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
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
                      m.sender_id === userId ||
                      m.sender_id?.toString?.() === userId?.toString() ||
                      m.sender_id?._id === userId;
                    const isTemp = String(m._id).startsWith("temp_");

                    const prevMsg = active.messages[idx - 1];
                    const nextMsg = active.messages[idx + 1];

                    const showDate =
                      !prevMsg ||
                      new Date(m.created_at).toDateString() !==
                        new Date(prevMsg.created_at).toDateString();

                    // Grouping: apakah pesan berikutnya dari sender yang sama?
                    const isLastInGroup =
                      !nextMsg ||
                      nextMsg.sender_id?.toString?.() !==
                        m.sender_id?.toString?.() ||
                      new Date(m.created_at).toDateString() !==
                        new Date(nextMsg.created_at).toDateString();

                    const isFirstInGroup =
                      !prevMsg ||
                      prevMsg.sender_id?.toString?.() !==
                        m.sender_id?.toString?.() ||
                      showDate;

                    return (
                      <div key={m._id}>
                        {showDate && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              margin: "12px 0 10px",
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
                                background: "var(--surface)",
                                padding: "3px 10px",
                                borderRadius: 20,
                                border: "1px solid var(--border)",
                              }}
                            >
                              {formatHeaderDate(m.created_at)}
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
                            marginBottom: isLastInGroup ? 6 : 2,
                          }}
                        >
                          <div
                            style={{
                              maxWidth: "68%",
                              padding: "8px 13px",
                              borderRadius: isMe
                                ? isFirstInGroup
                                  ? "16px 16px 4px 16px"
                                  : isLastInGroup
                                    ? "4px 16px 16px 4px"
                                    : "4px 16px 4px 4px"
                                : isFirstInGroup
                                  ? "16px 16px 16px 4px"
                                  : isLastInGroup
                                    ? "4px 16px 16px 16px"
                                    : "4px 4px 4px 16px",
                              background: isMe ? "var(--g1)" : "var(--surface)",
                              border: isMe ? "none" : "1px solid var(--border)",
                              color: isMe ? "#fff" : "var(--txt)",
                              fontSize: 13,
                              lineHeight: 1.5,
                              wordBreak: "break-word",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                              opacity: isTemp ? 0.6 : 1,
                              transition: "opacity 0.2s",
                            }}
                          >
                            {m.is_deleted_by_sender ? (
                              <em
                                style={{
                                  opacity: 0.6,
                                  fontSize: 12,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <i className="bi bi-slash-circle" />
                                Pesan dihapus
                              </em>
                            ) : (
                              m.content
                            )}
                          </div>

                          {isLastInGroup && (
                            <small
                              style={{
                                fontSize: 10,
                                color: "var(--txt4)",
                                marginTop: 2,
                                display: "flex",
                                alignItems: "center",
                                gap: 3,
                              }}
                            >
                              {isTemp ? (
                                <>
                                  <i
                                    className="bi bi-clock"
                                    style={{ fontSize: 9 }}
                                  />
                                  Mengirim...
                                </>
                              ) : (
                                <>
                                  {formatTime(m.created_at)}
                                  {isMe && (
                                    <i
                                      className="bi bi-check2"
                                      style={{
                                        fontSize: 11,
                                        color: "var(--g2)",
                                      }}
                                    />
                                  )}
                                </>
                              )}
                            </small>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}

                {/* Typing bubble */}
                {isTyping && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 6,
                      marginTop: 4,
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 16px",
                        borderRadius: "16px 16px 16px 4px",
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        gap: 4,
                        alignItems: "center",
                      }}
                    >
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: "var(--txt4)",
                            display: "inline-block",
                            animation: "typing-bounce 1.2s infinite",
                            animationDelay: `${i * 0.2}s`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Input ── */}
              <div
                style={{
                  padding: "10px 14px",
                  flexShrink: 0,
                  background: "var(--surface)",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <div
                  style={{ display: "flex", gap: 8, alignItems: "flex-end" }}
                >
                  <textarea
                    className="outfit"
                    placeholder="Tulis pesan..."
                    value={chatMsg}
                    rows={1}
                    style={{
                      flex: 1,
                      resize: "none",
                      borderRadius: 22,
                      border: "1px solid var(--border)",
                      padding: "10px 16px",
                      fontSize: 13,
                      fontFamily: "inherit",
                      outline: "none",
                      background: "var(--g5)",
                      color: "var(--txt)",
                      maxHeight: 120,
                      overflowY: "auto",
                    }}
                    onChange={handleTyping}
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
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
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
                    <i className="bi bi-send-fill" style={{ fontSize: 15 }} />
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
