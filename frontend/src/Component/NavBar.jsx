import { getBadge as getUserBadge } from "../utils/badgeHelper";
import React from "react";
import { Link } from "react-router-dom";
import { withRouter } from "../Wrapper/withRouter";
import api from "../utils/api";

const providerLinks = [
  { to: "/home", icon: "bi-house", label: "Beranda" },
  { to: "/donations", icon: "bi-box-seam", label: "Donasi" },
  { to: "/history", icon: "bi-clock-history", label: "Riwayat" },
  {
    to: "/messages",
    icon: "bi-chat-dots",
    label: "Pesan",
    badgeKey: "messages",
  },
  { to: "/community", icon: "bi-people", label: "Komunitas" },
  { to: "/leaderboard", icon: "bi-trophy", label: "Leaderboard" },
  { to: "/donations/create", icon: "bi-plus-circle", label: "Buat Donasi" },
];

const seekerLinks = [
  { to: "/home", icon: "bi-house", label: "Beranda" },
  { to: "/donations", icon: "bi-box-seam", label: "Donasi" },
  { to: "/history", icon: "bi-clock-history", label: "Riwayat" },
  {
    to: "/messages",
    icon: "bi-chat-dots",
    label: "Pesan",
    badgeKey: "messages",
  },
  { to: "/community", icon: "bi-people", label: "Komunitas" },
  { to: "/leaderboard", icon: "bi-trophy", label: "Leaderboard" },
];

const adminLinks = [
  { to: "/home", icon: "bi-house", label: "Beranda" },
  { to: "/donations", icon: "bi-box-seam", label: "Donasi" },
  { to: "/admin", icon: "bi-shield-check", label: "Admin" },
];

const NavLink = ({ to, icon, label, location, badge }) => {
  const isActive = location?.pathname === to;
  return (
    <Link
      to={to}
      className="outfit"
      style={{
        position: "relative",
        textDecoration: "none",
        color: isActive ? "var(--g1)" : "var(--txt3)",
        fontWeight: isActive ? 700 : 500,
        fontSize: 14,
        padding: "8px 6px",
        display: "flex",
        alignItems: "center",
        gap: 5,
        transition: "color 0.2s",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--g1)";
        e.currentTarget.querySelector(".nav-underline").style.width = "100%";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.color = "var(--txt3)";
        if (!isActive)
          e.currentTarget.querySelector(".nav-underline").style.width = "0%";
      }}
    >
      <span
        style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: 18 }} />
        {badge > 0 && (
          <span
            style={{
              position: "absolute",
              top: -5,
              left: -5,
              minWidth: 16,
              height: 16,
              borderRadius: 999,
              background: "#e05050",
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 4px",
              lineHeight: 1,
              border: "1.5px solid var(--surface)",
              boxShadow: "0 1px 4px rgba(224,80,80,0.4)",
              fontFamily: "inherit",
            }}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className="d-none d-xl-inline">{label}</span>
      <span
        className="nav-underline"
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 2,
          width: isActive ? "100%" : "0%",
          background: "linear-gradient(90deg, var(--g1), var(--g2))",
          borderRadius: 2,
          transition: "width 0.25s ease",
        }}
      />
    </Link>
  );
};

class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: document.documentElement.getAttribute("data-theme"),
      menuOpen: false,
      unreadMessages: 0,
    };
    this.pollInterval = null;
  }

  setTheme = () => {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    this.setState({ theme: newTheme });
  };

  fetchUnread = async () => {
    try {
      const res = await api.get("/conversations");
      const { user } = this.props.auth;
      const userId = user?.id || user?._id;
      const total = res.data.reduce((sum, conv) => {
        const isProvider =
          conv.provider_id?._id === userId || conv.provider_id === userId;
        return (
          sum +
          (isProvider ? conv.provider_unread || 0 : conv.seeker_unread || 0)
        );
      }, 0);
      this.setState({ unreadMessages: total });
    } catch {}
  };

  componentDidMount() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
    if (this.props.auth?.user) {
      this.fetchUnread();
      // Poll lebih jarang karena socket sudah handle realtime
      this.pollInterval = setInterval(this.fetchUnread, 10000);
      this.setupSocket();
    }
  }

  setupSocket = () => {
    import("../utils/socket").then(({ default: socket }) => {
      this.socket = socket;
      if (!socket.connected) {
        socket.connect();
      }

      const { user } = this.props.auth;
      const userId = user?.id || user?._id;

      // Join personal room agar hanya notif milik user ini yang masuk
      socket.emit("join_user", userId);

      // Event khusus: ada pesan baru untuk user ini (dari room pribadinya)
      socket.on("new_message_notify", () => {
        this.fetchUnread();
      });
      socket.on("conversation_updated", () => {
        this.fetchUnread();
      });
    });
  };

  componentDidUpdate(prevProps) {
    const wasLoggedIn = !!prevProps.auth?.user;
    const isLoggedIn = !!this.props.auth?.user;
    if (!wasLoggedIn && isLoggedIn) {
      this.fetchUnread();
      this.pollInterval = setInterval(this.fetchUnread, 30000);
      this.setupSocket();
    }
    if (wasLoggedIn && !isLoggedIn) {
      clearInterval(this.pollInterval);
      this.setState({ unreadMessages: 0 });
      if (this.socket) {
        this.socket.off("new_message_notify");
        this.socket.off("conversation_updated");
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.pollInterval);
    if (this.socket) {
      this.socket.off("new_message_notify");
      // Jangan disconnect di sini karena Messages.jsx masih pakai socket
    }
  }

  getLinks() {
    const { user } = this.props.auth;
    if (!user) return [];
    if (user.role === "admin") return adminLinks;
    if (user.role === "food_provider") return providerLinks;
    return seekerLinks;
  }

  render() {
    const { user } = this.props.auth;
    const location = this.props.location;
    const { menuOpen, unreadMessages } = this.state;

    const allLinks = this.getLinks();

    const getBadge = (link) => {
      if (link.badgeKey === "messages") return unreadMessages;
      return 0;
    };

    return (
      <nav
        className="sticky-top"
        style={{
          borderBottom: "1px solid var(--border)",
          backgroundColor: "var(--surface)",
          zIndex: 1050,
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 12,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Link
            to={user ? "/home" : "/"}
            className="text-decoration-none d-flex align-items-center gap-2"
            style={{ flexShrink: 0, minWidth: 0 }}
          >
            <img
              src="/assets/logo/foodrescue_logo_only.png"
              width={32}
              height={28}
              alt="FoodRescue Logo"
            />
            <div style={{ lineHeight: 1.1 }} className="d-none d-sm-block">
              <p
                className="syne-h1 text-green1"
                style={{ fontSize: 15, margin: 0 }}
              >
                FoodRescue
              </p>
              <p
                className="outfit"
                style={{
                  fontSize: 9,
                  color: "var(--txt4)",
                  margin: 0,
                  letterSpacing: "0.1em",
                }}
              >
                WEB PLATFORM
              </p>
            </div>
          </Link>
          <div
            className="d-none d-lg-flex align-items-center justify-content-center"
            style={{ gap: 20, minWidth: 0, overflow: "hidden" }}
          >
            {allLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                location={location}
                badge={getBadge(link)}
              />
            ))}
          </div>

          <div
            className="d-flex align-items-center gap-2"
            style={{ flexShrink: 0, justifyContent: "flex-end" }}
          >
            {user ? (
              <Link
                to="/profile"
                className="text-decoration-none d-none d-lg-flex align-items-center gap-2"
                style={{
                  padding: "6px 12px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surf2)",
                  transition: "all 0.2s",
                  maxWidth: 160,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--g2)";
                  e.currentTarget.style.background = "var(--g5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.background = "var(--surf2)";
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--g1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <i className="bi bi-person-fill" />
                  )}
                </div>
                <span
                  className="outfit"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--txt2)",
                    maxWidth: 100,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {(() => {
                    const badge = getUserBadge(user.total_points || 0);
                    const isAdmin = user.role === "admin";
                    return (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {!isAdmin && (
                          <span title={badge.level} style={{ fontSize: 14 }}>
                            {badge.emoji}
                          </span>
                        )}
                        {user.first_name} {user.last_name}
                      </span>
                    );
                  })()}
                </span>
              </Link>
            ) : (
              <div className="d-flex align-items-center gap-2 lp-navbar-auth">
                <Link
                  to="/login"
                  className="outfit"
                  style={{
                    padding: "7px 12px",
                    borderRadius: 10,
                    border: "1px solid var(--border)",
                    background: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--txt2)",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--g2)";
                    e.currentTarget.style.color = "var(--g1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--txt2)";
                  }}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="outfit"
                  style={{
                    padding: "7px 12px",
                    borderRadius: 10,
                    background: "var(--g1)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    textDecoration: "none",
                    transition: "opacity 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Register
                </Link>
              </div>
            )}
            <button
              className="theme-btn"
              onClick={this.setTheme}
              title="Toggle theme"
            >
              <i
                className={`bi ${this.state.theme === "dark" ? "bi-moon-fill" : "bi-sun-fill"}`}
              />
            </button>
            {user && (
              <button
                className="d-flex d-lg-none theme-btn"
                onClick={() => this.setState({ menuOpen: !menuOpen })}
              >
                <i
                  className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`}
                  style={{ fontSize: 20 }}
                />
              </button>
            )}
          </div>
        </div>
        {menuOpen && (
          <div
            className="d-lg-none"
            style={{
              borderTop: "1px solid var(--border)",
              background: "var(--surface)",
              padding: "12px 16px 16px",
            }}
          >
            <div className="d-flex flex-column gap-1 mb-3">
              {allLinks.map((link) => {
                const isActive = location?.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="outfit d-flex align-items-center gap-3"
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      textDecoration: "none",
                      fontSize: 14,
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? "var(--g1)" : "var(--txt2)",
                      background: isActive ? "var(--g5)" : "none",
                      border: isActive
                        ? "1px solid var(--g3)"
                        : "1px solid transparent",
                    }}
                    onClick={() => this.setState({ menuOpen: false })}
                  >
                    <i
                      className={`bi ${link.icon}`}
                      style={{ fontSize: 16, width: 20 }}
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div
              style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}
            >
              {user ? (
                <Link
                  to="/profile"
                  className="outfit d-flex align-items-center gap-3"
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--txt2)",
                  }}
                  onClick={() => this.setState({ menuOpen: false })}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--g1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    <i className="bi bi-person-fill" />
                  </div>
                  {(() => {
                    const badge = getUserBadge(user.total_points || 0);
                    const isAdmin = user.role === "admin";
                    return (
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        {!isAdmin && (
                          <span title={badge.level} style={{ fontSize: 14 }}>
                            {badge.emoji}
                          </span>
                        )}
                        {user.first_name} {user.last_name}
                      </span>
                    );
                  })()}
                </Link>
              ) : (
                <div className="d-flex gap-2">
                  <Link
                    to="/login"
                    className="outfit flex-fill text-center"
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "none",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--txt2)",
                      textDecoration: "none",
                    }}
                    onClick={() => this.setState({ menuOpen: false })}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="outfit flex-fill text-center"
                    style={{
                      padding: "10px",
                      borderRadius: 10,
                      background: "var(--g1)",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#fff",
                      textDecoration: "none",
                    }}
                    onClick={() => this.setState({ menuOpen: false })}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  }
}

export default withRouter(NavBar);
