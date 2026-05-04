import { useState, useEffect, useCallback, useRef } from "react";
import socket from "../utils/socket";
import api from "../utils/api";
import { useAuth } from "../Context/AuthContext";

const TOAST_ICONS = {
  donation_claimed: {
    icon: "bi-gift-fill",
    color: "#5f8b4c",
    bg: "rgba(95,139,76,0.12)",
    border: "rgba(95,139,76,0.3)",
  },
  claim_confirmed: {
    icon: "bi-check-circle-fill",
    color: "#4eb8d4",
    bg: "rgba(78,184,212,0.1)",
    border: "rgba(78,184,212,0.3)",
  },
  donation_completed: {
    icon: "bi-trophy-fill",
    color: "#5f8b4c",
    bg: "rgba(95,139,76,0.12)",
    border: "rgba(95,139,76,0.3)",
  },
  claim_cancelled: {
    icon: "bi-x-circle-fill",
    color: "#e05050",
    bg: "rgba(224,80,80,0.1)",
    border: "rgba(224,80,80,0.3)",
  },
  new_message: {
    icon: "bi-chat-dots-fill",
    color: "#7c5cbf",
    bg: "rgba(124,92,191,0.1)",
    border: "rgba(124,92,191,0.3)",
  },
  new_rating: {
    icon: "bi-star-fill",
    color: "#e8b84b",
    bg: "rgba(232,184,75,0.12)",
    border: "rgba(232,184,75,0.3)",
  },
  default: {
    icon: "bi-bell-fill",
    color: "var(--g2)",
    bg: "rgba(95,139,76,0.12)",
    border: "rgba(95,139,76,0.3)",
  },
};

let toastId = 0;

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 350);
  }, [onRemove, toast.id]);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 10);
    const t2 = setTimeout(() => handleClose(), 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [handleClose]);

  const cfg = TOAST_ICONS[toast.type] || TOAST_ICONS.default;

  return (
    <div
      onClick={handleClose}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "12px 14px",
        background: "var(--surface)",
        border: `1px solid ${cfg.border}`,
        borderRadius: 14,
        boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        cursor: "pointer",
        maxWidth: 340,
        width: "100%",
        transform:
          visible && !leaving
            ? "translateX(0) scale(1)"
            : "translateX(110%) scale(0.95)",
        opacity: visible && !leaving ? 1 : 0,
        transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 3,
          background: cfg.color,
          borderRadius: "0 0 14px 14px",
          animation: "toast-progress 4.5s linear forwards",
        }}
      />

      {/* Icon */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: cfg.bg,
          border: `1px solid ${cfg.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <i
          className={`bi ${cfg.icon}`}
          style={{ color: cfg.color, fontSize: 16 }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--txt)",
            marginBottom: 2,
            lineHeight: 1.3,
          }}
        >
          {toast.title}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: "var(--txt3)",
            lineHeight: 1.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {toast.body}
        </p>
      </div>

      {/* Close */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "none",
          background: "var(--g5)",
          color: "var(--txt4)",
          fontSize: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          padding: 0,
        }}
      >
        <i className="bi bi-x" />
      </button>

      <style>{`
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

function ToastNotification() {
  const { user } = useAuth();
  const [toasts, setToasts] = useState([]);
  const lastCheckRef = useRef(new Date().toISOString());
  const shownIdsRef = useRef(new Set());

  const addToast = useCallback((title, body, type) => {
    const id = ++toastId;
    setToasts((prev) => {
      const next = prev.length >= 4 ? prev.slice(1) : prev;
      return [...next, { id, title, body, type }];
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!user) return;

    const userId = user?.id || user?._id;
    const userIdStr = userId?.toString();

    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join_user", userIdStr);

    const pollNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        const recent = (res.data.notifications || []).filter((n) => {
          if (n.is_read) return false;
          if (shownIdsRef.current.has(n._id)) return false;
          return new Date(n.created_at) > new Date(lastCheckRef.current);
        });
        recent.forEach((n) => {
          shownIdsRef.current.add(n._id);
          if (n.type !== "new_message") {
            addToast(n.title, n.body, n.type);
          }
        });
        if (recent.length > 0) {
          lastCheckRef.current = new Date().toISOString();
        }
      } catch {}
    };

    pollNotifications();
    const pollInterval = setInterval(pollNotifications, 15000);
    const handleNewMessageNotify = (data) => {
      addToast(
        "Pesan Baru 💬",
        data.preview || "Ada pesan baru untukmu",
        "new_message",
      );
    };

    const handlePushNotif = (data) => {
      addToast(data.title, data.body, data.type);
    };

    socket.off("new_message_notify", handleNewMessageNotify);
    socket.off("push_notification", handlePushNotif);

    socket.on("new_message_notify", handleNewMessageNotify);
    socket.on("push_notification", handlePushNotif);

    return () => {
      clearInterval(pollInterval);
      socket.off("new_message_notify", handleNewMessageNotify);
      socket.off("push_notification", handlePushNotif);
    };
  }, [user, addToast]);

  if (toasts.length === 0) return null;

  return (
    <div
      className="outfit"
      style={{
        position: "fixed",
        top: 70,
        right: 16,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

export default ToastNotification;
