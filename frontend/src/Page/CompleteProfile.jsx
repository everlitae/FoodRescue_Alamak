import React from "react";
import api from "../utils/api";
import { AuthContext } from "../Context/AuthContext";

const KOTA_LIST = [
  "Banda Aceh",
  "Medan",
  "Padang",
  "Pekanbaru",
  "Batam",
  "Jambi",
  "Palembang",
  "Bengkulu",
  "Bandar Lampung",
  "Jakarta",
  "Bogor",
  "Depok",
  "Tangerang",
  "Bekasi",
  "Bandung",
  "Cirebon",
  "Semarang",
  "Yogyakarta",
  "Solo",
  "Surabaya",
  "Malang",
  "Madiun",
  "Kediri",
  "Jember",
  "Denpasar",
  "Mataram",
  "Kupang",
  "Pontianak",
  "Palangkaraya",
  "Banjarmasin",
  "Balikpapan",
  "Samarinda",
  "Makassar",
  "Manado",
  "Palu",
  "Kendari",
  "Gorontalo",
  "Ambon",
  "Ternate",
  "Jayapura",
  "Lainnya",
];

class CompleteProfile extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      apiError: "",
      theme: "light",
      role: "food_provider",
      firstName: "",
      firstNameError: "",
      firstNameTouched: false,
      lastName: "",
      lastNameError: "",
      lastNameTouched: false,
      username: "",
      usernameError: "",
      usernameTouched: false,
      phone: "",
      phoneError: "",
      phoneTouched: false,
      city: "",
      customCity: "",
      cityOpen: false,
      citySearch: "",
      success: false,
    };
    this.cityDropdownRef = React.createRef();
  }

  componentDidMount() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.setState({ theme: savedTheme });

    const { user } = this.context;
    if (user) {
      this.setState({
        firstName: user.first_name !== "User" ? user.first_name || "" : "",
        lastName: user.last_name || "",
      });
    }

    this.handleClickOutside = (e) => {
      if (
        this.cityDropdownRef.current &&
        !this.cityDropdownRef.current.contains(e.target)
      ) {
        this.setState({ cityOpen: false, citySearch: "" });
      }
    };
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  isOAuthUser = () => {
    const { user } = this.context;
    return user?.oauth_provider === "google";
  };

  validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  validateUsername = (username) => /^[A-Za-z0-9_]{6,}$/.test(username);
  validatePhone = (phone) => /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/.test(phone);

  handleSubmit = async () => {
    const { role, firstName, lastName, username, phone, city, customCity } =
      this.state;
    let hasError = false;

    if (!firstName) {
      this.setState({
        firstNameError: "Nama depan wajib diisi",
        firstNameTouched: true,
      });
      hasError = true;
    } else if (!this.validateName(firstName)) {
      this.setState({
        firstNameError: "Hanya boleh huruf A-Z",
        firstNameTouched: true,
      });
      hasError = true;
    }

    if (!username) {
      this.setState({
        usernameError: "Username wajib diisi",
        usernameTouched: true,
      });
      hasError = true;
    } else if (!this.validateUsername(username)) {
      this.setState({
        usernameError: "Username minimal 6 karakter (huruf/angka)",
        usernameTouched: true,
      });
      hasError = true;
    }

    if (!city) {
      this.setState({ apiError: "Kota wajib dipilih" });
      hasError = true;
    } else if (city === "Lainnya" && !customCity.trim()) {
      this.setState({ apiError: "Masukkan nama kota kamu" });
      hasError = true;
    }

    if (phone && !this.validatePhone(phone)) {
      this.setState({
        phoneError: "Format nomor HP tidak sesuai",
        phoneTouched: true,
      });
      hasError = true;
    }

    if (hasError) return;

    this.setState({ loading: true, apiError: "" });
    try {
      const res = await api.post("/auth/complete-profile", {
        role,
        first_name: firstName,
        last_name: lastName,
        username,
        phone: phone || undefined,
        city: city === "Lainnya" ? customCity.trim() : city,
      });
      this.context.login(res.data.token, res.data.user, true);
      this.setState({ success: true });
      setTimeout(() => {
        window.location.href = "/home";
      }, 2500);
    } catch (err) {
      this.setState({ apiError: err.response?.data?.msg || "Server error" });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { cityOpen, citySearch, city, success } = this.state;
    const isOAuth = this.isOAuthUser();
    const filteredKota = KOTA_LIST.filter((k) =>
      k.toLowerCase().includes((citySearch || "").toLowerCase()),
    );

    return (
      <>
        {/* ── SUCCESS OVERLAY ─────────────────────────────────────── */}
        {success && (
          <>
            <style>{`
              @keyframes fr-fade-in { from { opacity: 0; } to { opacity: 1; } }
              @keyframes fr-scale-in { from { opacity: 0; transform: scale(0.7) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }
              @keyframes fr-check-pop { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); } }
              @keyframes fr-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
              @keyframes fr-glow-pulse { 0%, 100% { box-shadow: 0 0 30px rgba(95,139,76,0.4), 0 0 60px rgba(95,139,76,0.2); } 50% { box-shadow: 0 0 50px rgba(95,139,76,0.7), 0 0 100px rgba(95,139,76,0.3); } }
              @keyframes fr-ring { 0% { transform: scale(0.8); opacity: 0.8; } 100% { transform: scale(1.8); opacity: 0; } }
              @keyframes fr-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
            `}</style>

            {/* Backdrop */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9998,
                background: "rgba(0,0,0,0.65)",
                backdropFilter: "blur(8px)",
                animation: "fr-fade-in 0.3s ease-out",
              }}
            />

            {/* Modal */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 9999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <div
                style={{
                  background: "var(--surface, #1a2e14)",
                  border: "1px solid rgba(95,139,76,0.4)",
                  borderRadius: 28,
                  padding: "48px 44px",
                  textAlign: "center",
                  maxWidth: 400,
                  width: "100%",
                  boxShadow:
                    "0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(95,139,76,0.15)",
                  animation:
                    "fr-scale-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Background glow */}
                <div
                  style={{
                    position: "absolute",
                    top: -60,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 200,
                    height: 200,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(95,139,76,0.2) 0%, transparent 70%)",
                    pointerEvents: "none",
                  }}
                />

                {/* Ping rings */}
                <div
                  style={{
                    position: "absolute",
                    top: 48,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    border: "2px solid rgba(95,139,76,0.4)",
                    animation: "fr-ring 2s ease-out 0.5s infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 48,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    border: "2px solid rgba(95,139,76,0.3)",
                    animation: "fr-ring 2s ease-out 0.9s infinite",
                  }}
                />

                {/* Icon */}
                <div
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #3d6b2e, #5f8b4c, #7aaf60)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                    animation:
                      "fr-glow-pulse 2.5s ease-in-out infinite, fr-float 3s ease-in-out infinite",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <i
                    className="bi bi-person-check-fill"
                    style={{
                      fontSize: 44,
                      color: "#fff",
                      animation:
                        "fr-check-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both",
                    }}
                  />
                </div>

                {/* Title */}
                <h2
                  style={{
                    fontFamily: '"Syne", sans-serif',
                    fontSize: 28,
                    fontWeight: 800,
                    background:
                      "linear-gradient(135deg, #7aaf60 0%, #5f8b4c 50%, #b8694a 100%)",
                    backgroundSize: "200% auto",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 10,
                    animation: "fr-shimmer 3s linear infinite",
                  }}
                >
                  Profil Lengkap! 🎉
                </h2>

                {/* Divider */}
                <div
                  style={{
                    height: 2,
                    borderRadius: 999,
                    margin: "16px auto",
                    width: 60,
                    background:
                      "linear-gradient(90deg, transparent, rgba(95,139,76,0.6), transparent)",
                  }}
                />

                {/* Text */}
                <p
                  style={{
                    color: "var(--txt3, rgba(255,255,255,0.6))",
                    fontSize: 14,
                    lineHeight: 1.8,
                    marginBottom: 28,
                  }}
                >
                  Selamat datang di{" "}
                  <strong style={{ color: "var(--g2, #5f8b4c)" }}>
                    FoodRescue
                  </strong>
                  !
                  <br />
                  Akunmu sudah siap digunakan.
                </p>

                {/* Progress bar */}
                <div
                  style={{
                    background: "rgba(95,139,76,0.15)",
                    borderRadius: 999,
                    height: 5,
                    overflow: "hidden",
                    border: "1px solid rgba(95,139,76,0.2)",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 999,
                      background:
                        "linear-gradient(90deg, #5f8b4c, #7aaf60, #b8694a, #7aaf60)",
                      backgroundSize: "200% auto",
                      animation: "fr-shimmer 1.5s linear infinite",
                      width: "100%",
                    }}
                  />
                </div>

                <p
                  style={{
                    color: "var(--txt4, rgba(255,255,255,0.3))",
                    fontSize: 11,
                    marginTop: 10,
                    letterSpacing: "0.05em",
                  }}
                >
                  Mengalihkan ke beranda...
                </p>
              </div>
            </div>
          </>
        )}

        {/* ── FORM ─────────────────────────────────────────────────── */}
        <div
          className="w-100 min-vh-100 h-100 d-flex flex-row"
          style={success ? { filter: "blur(3px)", pointerEvents: "none" } : {}}
        >
          {/* Left Panel */}
          <div className="d-none d-md-flex col-6 h-100 flex-column justify-content-between p-5 left-signin position-relative grid-detail text-white">
            <div className="d-flex flex-wrap align-items-center justify-content-start gap-3">
              <img
                src="/assets/logo/foodrescue_logo_only.png"
                width={"55px"}
                height={"50px"}
                alt=""
              />
              <div>
                <h5 className="syne-h1">FoodRescue</h5>
                <p className="outfit">
                  <small>WEB PLATFORM</small>
                </p>
              </div>
            </div>
            <div className="fade-in">
              <h1 className="syne-h1">
                Hampir Selesai! <span style={{ color: "var(--cr3)" }}>🎉</span>
              </h1>
              <p className="outfit mb-3">
                Lengkapi profilmu agar pengalaman FoodRescue lebih personal dan
                relevan untukmu.
              </p>
              <div className="card-transparent p-3 rounded-4">
                <p className="outfi fw-light">
                  "Dengan profil yang lengkap, kamu bisa lebih mudah terhubung
                  dengan sesama pengguna FoodRescue di kotamu."
                </p>
              </div>
            </div>
            <div className="outfit fw-lighter">
              <p>Alamak Agile IFA-Sore</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-12 col-md-6 p-5 right-signin h-100 overflow-auto">
            <div className="d-flex flex-row align-items-center justify-content-between mb-4">
              <div />
              <button
                className="theme-btn"
                onClick={() => {
                  const newTheme =
                    this.state.theme === "dark" ? "light" : "dark";
                  document.documentElement.setAttribute("data-theme", newTheme);
                  localStorage.setItem("theme", newTheme);
                  this.setState({ theme: newTheme });
                }}
              >
                <i
                  className={`bi ${this.state.theme === "dark" ? "bi-moon-fill" : "bi-sun-fill"}`}
                ></i>
              </button>
            </div>

            {/* Stepper */}
            <div className="d-flex align-items-center gap-2 mb-4">
              {[
                { num: 1, label: "Daftar" },
                { num: 2, label: "Verifikasi" },
                { num: 3, label: "Profil" },
              ].map((s, i, arr) => (
                <React.Fragment key={s.num}>
                  <div
                    className="d-flex flex-column align-items-center"
                    style={{ gap: 4 }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                        background:
                          s.num <= 2
                            ? "var(--g1)"
                            : "linear-gradient(135deg, var(--g1), var(--g2))",
                        color: "#fff",
                        border:
                          s.num === 3
                            ? "2px solid var(--g2)"
                            : "2px solid transparent",
                        boxShadow: s.num === 3 ? "0 0 0 4px var(--g4)" : "none",
                      }}
                    >
                      {s.num <= 2 ? <i className="bi bi-check" /> : s.num}
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--txt2)",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        marginBottom: 18,
                        borderRadius: 2,
                        background:
                          "linear-gradient(90deg, var(--g1), var(--g2))",
                        maxWidth: 60,
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="mb-4">
              <h3 className="syne-h1 text-green1">Lengkapi Profil</h3>
              <p className="outfit fw-light text-green3">
                {isOAuth
                  ? "Isi info tambahan untuk melengkapi akun Google kamu"
                  : "Sedikit lagi, lengkapi data dirimu"}
              </p>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Role Selector */}
              <div>
                <label className="text-green3 fw-semibold mb-2">
                  PILIH PERANMU
                </label>
                <div className="role-container">
                  <div
                    className={`role-card ${this.state.role === "food_provider" ? "active-provider" : ""}`}
                    onClick={() => this.setState({ role: "food_provider" })}
                  >
                    <div className="role-check">
                      {this.state.role === "food_provider" && (
                        <i className="bi bi-check"></i>
                      )}
                    </div>
                    <div className="role-icon">🍱</div>
                    <div className="role-title">Food Provider</div>
                    <div className="role-description">
                      Saya memiliki makanan lebih untuk didonasikan
                    </div>
                  </div>
                  <div
                    className={`role-card ${this.state.role === "food_seeker" ? "active-seeker" : ""}`}
                    onClick={() => this.setState({ role: "food_seeker" })}
                  >
                    <div className="role-check">
                      {this.state.role === "food_seeker" && (
                        <i className="bi bi-check"></i>
                      )}
                    </div>
                    <div className="role-icon">🙏</div>
                    <div className="role-title">Food Seeker</div>
                    <div className="role-description">
                      Saya mencari donasi makanan yang tersedia
                    </div>
                  </div>
                </div>
              </div>

              {/* Nama - non OAuth */}
              {!isOAuth && (
                <div className="d-flex flex-column flex-md-row gap-3">
                  <div className="flex-grow-1 d-flex flex-column gap-1">
                    <label className="text-green3 fw-semibold">
                      NAMA DEPAN
                    </label>
                    <div className="input-group rounded-3">
                      <input
                        type="text"
                        className={`form-control py-2 px-3 ${this.state.firstNameTouched && this.state.firstNameError ? "input-error" : "input-green"}`}
                        placeholder="John"
                        value={this.state.firstName}
                        onChange={(e) =>
                          this.setState({
                            firstName: e.target.value,
                            firstNameError: "",
                          })
                        }
                        onBlur={() =>
                          this.setState({
                            firstNameError:
                              this.state.firstName &&
                              !this.validateName(this.state.firstName)
                                ? "Hanya huruf A-Z"
                                : "",
                            firstNameTouched: true,
                          })
                        }
                      />
                      <span className="input-group-text input-green">
                        <i className="bi bi-person"></i>
                      </span>
                    </div>
                    {this.state.firstNameTouched &&
                      this.state.firstNameError && (
                        <small className="text-danger">
                          {this.state.firstNameError}
                        </small>
                      )}
                  </div>
                  <div className="flex-grow-1 d-flex flex-column gap-1">
                    <label className="text-green3 fw-semibold">
                      NAMA BELAKANG
                    </label>
                    <div className="input-group rounded-3">
                      <input
                        type="text"
                        className={`form-control py-2 px-3 ${this.state.lastNameTouched && this.state.lastNameError ? "input-error" : "input-green"}`}
                        placeholder="Doe"
                        value={this.state.lastName}
                        onChange={(e) =>
                          this.setState({
                            lastName: e.target.value,
                            lastNameError: "",
                          })
                        }
                        onBlur={() =>
                          this.setState({
                            lastNameError:
                              this.state.lastName &&
                              !this.validateName(this.state.lastName)
                                ? "Hanya huruf A-Z"
                                : "",
                            lastNameTouched: true,
                          })
                        }
                      />
                      <span className="input-group-text input-green">
                        <i className="bi bi-person"></i>
                      </span>
                    </div>
                    {this.state.lastNameTouched && this.state.lastNameError && (
                      <small className="text-danger">
                        {this.state.lastNameError}
                      </small>
                    )}
                  </div>
                </div>
              )}

              {/* Nama - OAuth */}
              {isOAuth && (
                <div className="d-flex flex-column flex-md-row gap-3">
                  <div className="flex-grow-1 d-flex flex-column gap-1">
                    <label className="text-green3 fw-semibold">
                      NAMA DEPAN{" "}
                      <span style={{ fontSize: 11, fontWeight: 400 }}>
                        (dari Google)
                      </span>
                    </label>
                    <div className="input-group rounded-3">
                      <input
                        type="text"
                        className="form-control py-2 px-3 input-green"
                        value={this.state.firstName}
                        onChange={(e) =>
                          this.setState({ firstName: e.target.value })
                        }
                      />
                      <span className="input-group-text input-green">
                        <i className="bi bi-person"></i>
                      </span>
                    </div>
                  </div>
                  <div className="flex-grow-1 d-flex flex-column gap-1">
                    <label className="text-green3 fw-semibold">
                      NAMA BELAKANG{" "}
                      <span style={{ fontSize: 11, fontWeight: 400 }}>
                        (dari Google)
                      </span>
                    </label>
                    <div className="input-group rounded-3">
                      <input
                        type="text"
                        className="form-control py-2 px-3 input-green"
                        value={this.state.lastName}
                        onChange={(e) =>
                          this.setState({ lastName: e.target.value })
                        }
                      />
                      <span className="input-group-text input-green">
                        <i className="bi bi-person"></i>
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Username */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold">USERNAME</label>
                <div className="input-group rounded-3">
                  <input
                    type="text"
                    className={`form-control py-2 px-3 ${this.state.usernameTouched && this.state.usernameError ? "input-error" : "input-green"}`}
                    placeholder="Minimal 6 karakter"
                    value={this.state.username}
                    onChange={(e) =>
                      this.setState({
                        username: e.target.value.toLowerCase(),
                        usernameError: "",
                      })
                    }
                    onBlur={() =>
                      this.setState({
                        usernameError:
                          this.state.username &&
                          !this.validateUsername(this.state.username)
                            ? "Username minimal 6 karakter (huruf/angka)"
                            : "",
                        usernameTouched: true,
                      })
                    }
                  />
                  <span
                    className={`input-group-text ${this.state.usernameTouched && this.state.usernameError ? "input-error" : "input-green"}`}
                  >
                    <i className="bi bi-at"></i>
                  </span>
                </div>
                {this.state.usernameTouched && this.state.usernameError && (
                  <small className="text-danger">
                    {this.state.usernameError}
                  </small>
                )}
              </div>

              {/* Kota */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold">
                  KOTA / KABUPATEN
                </label>
                <div
                  style={{ position: "relative" }}
                  ref={this.cityDropdownRef}
                >
                  <div
                    onClick={() =>
                      this.setState({ cityOpen: !cityOpen, citySearch: "" })
                    }
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: cityOpen
                        ? "1px solid var(--g2)"
                        : "1px solid var(--border)",
                      padding: "9px 12px",
                      fontSize: 13,
                      background: "var(--g5)",
                      color: city ? "var(--txt)" : "var(--txt4)",
                      cursor: "pointer",
                      userSelect: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 8 }}
                    >
                      <i
                        className="bi bi-geo-alt"
                        style={{ color: "var(--g2)", fontSize: 13 }}
                      />
                      {city || "Pilih Kota..."}
                    </span>
                    <i
                      className={`bi bi-chevron-${cityOpen ? "up" : "down"}`}
                      style={{ fontSize: 12, color: "var(--txt4)" }}
                    />
                  </div>
                  {cityOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        zIndex: 200,
                        background: "var(--surface)",
                        border: "1px solid var(--g3)",
                        borderRadius: 12,
                        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "10px 10px 8px",
                          borderBottom: "1px solid var(--border)",
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
                            autoFocus
                            placeholder="Cari kota..."
                            value={citySearch}
                            onChange={(e) =>
                              this.setState({ citySearch: e.target.value })
                            }
                            style={{
                              width: "100%",
                              border: "1px solid var(--border)",
                              borderRadius: 8,
                              padding: "7px 10px 7px 30px",
                              fontSize: 12,
                              background: "var(--g5)",
                              outline: "none",
                              color: "var(--txt)",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ maxHeight: 220, overflowY: "auto" }}>
                        {filteredKota.length === 0 ? (
                          <div
                            style={{
                              padding: "20px",
                              textAlign: "center",
                              color: "var(--txt4)",
                              fontSize: 13,
                            }}
                          >
                            Kota tidak ditemukan
                          </div>
                        ) : (
                          filteredKota.map((kota) => {
                            const isSelected = city === kota;
                            return (
                              <div
                                key={kota}
                                onClick={() =>
                                  this.setState({
                                    city: kota,
                                    cityOpen: false,
                                    citySearch: "",
                                    customCity: "",
                                  })
                                }
                                style={{
                                  padding: "9px 14px",
                                  fontSize: 13,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  color: isSelected
                                    ? "var(--g1)"
                                    : "var(--txt)",
                                  background: isSelected
                                    ? "rgba(95,139,76,0.08)"
                                    : "transparent",
                                  fontWeight: isSelected ? 600 : 400,
                                }}
                                onMouseEnter={(e) => {
                                  if (!isSelected)
                                    e.currentTarget.style.background =
                                      "var(--g5)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = isSelected
                                    ? "rgba(95,139,76,0.08)"
                                    : "transparent";
                                }}
                              >
                                <i
                                  className="bi bi-geo-alt"
                                  style={{
                                    color: isSelected
                                      ? "var(--g1)"
                                      : "var(--txt4)",
                                    fontSize: 12,
                                  }}
                                />
                                <span style={{ flex: 1 }}>{kota}</span>
                                {isSelected && (
                                  <i
                                    className="bi bi-check2"
                                    style={{ color: "var(--g1)", fontSize: 15 }}
                                  />
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                {city === "Lainnya" && (
                  <input
                    type="text"
                    className="form-control input-green mt-2"
                    placeholder="Masukkan nama kota..."
                    value={this.state.customCity}
                    onChange={(e) =>
                      this.setState({ customCity: e.target.value })
                    }
                  />
                )}
              </div>

              {/* No HP */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold">
                  NOMOR HP{" "}
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--txt4)",
                      fontWeight: 400,
                    }}
                  >
                    (opsional)
                  </span>
                </label>
                <div className="input-group rounded-3">
                  <input
                    type="tel"
                    className={`form-control py-2 px-3 ${this.state.phoneTouched && this.state.phoneError ? "input-error" : "input-green"}`}
                    placeholder="+628123456789"
                    value={this.state.phone}
                    onChange={(e) =>
                      this.setState({ phone: e.target.value, phoneError: "" })
                    }
                    onBlur={() =>
                      this.setState({
                        phoneError:
                          this.state.phone &&
                          !this.validatePhone(this.state.phone)
                            ? "Format nomor HP tidak sesuai"
                            : "",
                        phoneTouched: true,
                      })
                    }
                  />
                  <span
                    className={`input-group-text ${this.state.phoneTouched && this.state.phoneError ? "input-error" : "input-green"}`}
                  >
                    <i className="bi bi-telephone"></i>
                  </span>
                </div>
                {this.state.phoneTouched && this.state.phoneError && (
                  <small className="text-danger">{this.state.phoneError}</small>
                )}
              </div>

              {this.state.apiError && (
                <small className="text-danger">{this.state.apiError}</small>
              )}

              {/* Submit */}
              <button
                onClick={this.handleSubmit}
                disabled={this.state.loading}
                className="btn btn-outline-dark py-3 fs-6 fw-bold d-flex flex-row justify-content-center gap-2 rounded-3 btn-green-gradient"
              >
                {this.state.loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" />{" "}
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle"></i>
                    <span>Simpan & Masuk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default CompleteProfile;
