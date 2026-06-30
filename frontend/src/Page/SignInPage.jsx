import React from "react";
import api from "../utils/api";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

class SignInPage extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      theme: "light",
      loginError: "",
      identifier: "",
      identifierError: "",
      identifierTouched: false,
      password: "",
      passwordError: "",
      passwordTouched: false,
      showPassword: false,
      redirect: false,
      rememberMe: false,
      loading: false,
      needVerify: false,
      needVerifyEmail: "",
      googleError: "",
    };
  }

  setTheme = () => {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    this.setState({ theme: newTheme });
  };

  validateIdentifier = (value) => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isUsername = /^[A-Za-z0-9_]{3,}$/.test(value);
    return isEmail || isUsername;
  };

  handleIdentifierChange = (e) =>
    this.setState({
      identifier: e.target.value,
      identifierError: "",
      loginError: "",
    });

  handleIdentifierBlur = () => {
    const { identifier } = this.state;
    this.setState({
      identifierError:
        identifier && !this.validateIdentifier(identifier)
          ? "Masukkan email atau username yang valid"
          : "",
      identifierTouched: true,
    });
  };

  handlePasswordChange = (e) =>
    this.setState({
      password: e.target.value,
      passwordError: "",
      passwordTouched: false,
      loginError: "",
    });

  handlePasswordBlur = () => {
    const { password } = this.state;
    this.setState({
      passwordError: !password ? "Password wajib diisi" : "",
      passwordTouched: true,
    });
  };

  handleSubmit = () => {
    const { identifier, password } = this.state;

    if (!identifier && !password) {
      this.setState({
        identifierError: "Email atau username wajib diisi",
        passwordError: "Password wajib diisi",
      });
      return;
    }

    if (!identifier) {
      this.setState({ identifierError: "Email atau username wajib diisi" });
      return;
    }

    if (!this.validateIdentifier(identifier)) {
      this.setState({
        identifierError: "Masukkan email atau username yang valid",
      });
      return;
    }

    if (!password) {
      this.setState({ passwordError: "Password wajib diisi" });
      return;
    }

    this.getUser();
  };

  togglePassword = () =>
    this.setState({ showPassword: !this.state.showPassword });

  async getUser() {
    const email = this.state.identifier.trim().toLowerCase();
    const password = this.state.password;
    this.setState({ loading: true, loginError: "" });

    try {
      const res = await api.post("/auth/login", { email, password });
      this.context.login(res.data.token, res.data.user, this.state.rememberMe);
      this.setState({ redirect: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.requireVerification) {
        this.setState({
          needVerify: true,
          needVerifyEmail: data.email || email,
          loginError: "",
        });
      } else {
        this.setState({ loginError: data?.msg || "Login gagal" });
      }
    } finally {
      this.setState({ loading: false });
    }
  }

  componentDidMount() {
    // Cek error dari Google OAuth callback
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error === "account_not_found") {
      this.setState({
        googleError:
          "Akun Google ini belum terdaftar. Silakan daftar terlebih dahulu.",
      });
    } else if (error === "google_failed") {
      this.setState({ googleError: "Login dengan Google gagal. Coba lagi." });
    }
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.setState({ theme: savedTheme });
  }

  render() {
    if (this.state.redirect) {
      return <Navigate to="/home" />;
    }

    return (
      <>
        <div className="w-100 min-vh-100 h-100 d-flex flex-row">
          {/* Left Panel */}
          <div className="d-none d-md-flex col-6 h-100 flex-column justify-content-between p-5 left-signin position-relative grid-detail-light text-white">
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
              <h1 className="syne-h1">Selamat Datang Kembali 👋</h1>
              <p className="outfit mb-3">
                Masuk ke akun FoodRescue dan lanjutkan misi mulia mengurangi
                sisa makan bersama.
              </p>
              <div className="card-transparent p-3 rounded-4">
                <p className="outfi fw-light">
                  "Sudah 3 tahun bergabung dan kami telah menyalurkan lebih dari
                  200 porsi makanan kepada yang membutuhkan"
                </p>
                <p className="outfi fw-lighter">
                  <small>Rizal Ainun Harifin - Food Provider Medan</small>
                </p>
              </div>
            </div>
            <div className="outfit fw-lighter">
              <p>Alamak Agile IFA-Sore</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-12 col-md-6 p-5 right-signin h-100">
            <div className="d-flex flex-row align-items-center justify-content-between mb-5">
              <p
                className="outfit text-green3 fw-light back-btn"
                onClick={() => window.history.back()}
              >
                <i className="bi bi-arrow-left-short"></i> Kembali
              </p>
              <button className="theme-btn" onClick={this.setTheme}>
                <i
                  className={`bi ${this.state.theme === "dark" ? "bi-moon-fill" : "bi-sun-fill"}`}
                ></i>
              </button>
            </div>

            <div className="mb-5">
              <h3 className="syne-h1 text-green1">Masuk ke Akun</h3>
              <p className="outfit fw-light text-green3">
                Belum punya akun?{" "}
                <Link
                  to="/register"
                  className="outfit fw-semibold text-green3 login-link"
                  style={{ textDecoration: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Buat Gratis
                </Link>
              </p>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Email atau Username */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold">
                  EMAIL ATAU USERNAME
                </label>
                <div className="input-group rounded-3">
                  <input
                    type="text"
                    className={`form-control py-2 px-3 ${this.state.identifierError ? "input-error" : "input-green"}`}
                    placeholder="Email atau username"
                    value={this.state.identifier}
                    onChange={this.handleIdentifierChange}
                    onBlur={this.handleIdentifierBlur}
                  />
                  <span className="input-group-text input-green">
                    <i className="bi bi-person"></i>
                  </span>
                </div>
                {this.state.identifierTouched && this.state.identifierError && (
                  <small className="text-danger">
                    {this.state.identifierError}
                  </small>
                )}
              </div>

              {/* Password */}
              <div className="d-flex flex-column gap-1 rounded-3">
                <label className="text-green3 fw-semibold fs-6">PASSWORD</label>
                <div className="input-group position-relative">
                  <input
                    type={this.state.showPassword ? "text" : "password"}
                    className={`form-control py-2 px-3 ${this.state.passwordError ? "input-error" : "input-green"} pe-5`}
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                    onBlur={this.handlePasswordBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") this.handleSubmit();
                    }}
                  />
                  <i
                    className={`bi ${this.state.showPassword ? "bi-eye-slash" : "bi-eye"} eye-inside`}
                    onClick={this.togglePassword}
                  ></i>
                  <span className="input-group-text input-green">
                    <i className="bi bi-lock"></i>
                  </span>
                </div>
                {this.state.passwordTouched && this.state.passwordError && (
                  <small className="text-danger">
                    {this.state.passwordError}
                  </small>
                )}
              </div>

              {/* Error login */}
              {this.state.loginError && (
                <small className="text-danger">{this.state.loginError}</small>
              )}

              {/* Banner: email belum diverifikasi */}
              {this.state.needVerify && (
                <div
                  style={{
                    background: "rgba(124,92,191,0.08)",
                    border: "1px solid rgba(124,92,191,0.3)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <i
                      className="bi bi-envelope-exclamation-fill"
                      style={{ color: "#7c5cbf", fontSize: 16 }}
                    />
                    <p
                      className="outfit mb-0"
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "var(--txt)",
                      }}
                    >
                      Email belum diverifikasi
                    </p>
                  </div>
                  <p
                    className="outfit mb-0"
                    style={{
                      fontSize: 12,
                      color: "var(--txt3)",
                      lineHeight: 1.6,
                    }}
                  >
                    Akun dengan email{" "}
                    <strong>{this.state.needVerifyEmail}</strong> belum aktif.
                    Cek inbox kamu atau klik tombol di bawah untuk kirim ulang
                    kode OTP.
                  </p>
                  <button
                    className="outfit"
                    onClick={() => {
                      window.location.href = `/register?verify=${encodeURIComponent(this.state.needVerifyEmail)}`;
                    }}
                    style={{
                      padding: "9px 16px",
                      borderRadius: 10,
                      border: "1px solid rgba(124,92,191,0.4)",
                      background: "rgba(124,92,191,0.12)",
                      color: "#7c5cbf",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      textAlign: "center",
                    }}
                  >
                    <i className="bi bi-send me-2" />
                    Kirim Ulang Kode Verifikasi
                  </button>
                </div>
              )}

              {/* Remember me & Lupa password */}
              <div className="d-flex flex-row justify-content-between">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="checkDefault"
                    checked={this.state.rememberMe}
                    onChange={(e) =>
                      this.setState({ rememberMe: e.target.checked })
                    }
                  />
                  <label
                    className="form-check-label outfit text-green3"
                    htmlFor="checkDefault"
                  >
                    Ingat saya
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="outfit fw-semibold text-green3 login-link"
                  style={{ textDecoration: "none" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textDecoration = "underline")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.textDecoration = "none")
                  }
                >
                  Lupa Password?
                </Link>
              </div>

              {/* Submit */}
              <button
                onClick={this.handleSubmit}
                disabled={this.state.loading}
                className="btn btn-outline-dark py-3 fs-6 fw-bold d-flex flex-row justify-content-center gap-2 rounded-3 btn-green-gradient"
              >
                {this.state.loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm" />{" "}
                    Memproses...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Masuk Sekarang</span>
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="d-flex align-items-center gap-2 my-1">
                <hr
                  className="flex-grow-1 m-0"
                  style={{ borderColor: "var(--border)" }}
                />
                <span
                  className="outfit fw-light"
                  style={{ fontSize: 12, color: "var(--txt4)" }}
                >
                  atau masuk dengan
                </span>
                <hr
                  className="flex-grow-1 m-0"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              {/* Google Error */}
              {this.state.googleError && (
                <div
                  style={{
                    background: "rgba(220,53,69,0.08)",
                    border: "1px solid rgba(220,53,69,0.3)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    fontSize: 13,
                    color: "#dc3545",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <i className="bi bi-exclamation-triangle-fill" />
                  <span>
                    {this.state.googleError}{" "}
                    <a
                      href="/register"
                      style={{ color: "#dc3545", fontWeight: 700 }}
                    >
                      Daftar di sini
                    </a>
                  </span>
                </div>
              )}

              {/* Google OAuth Button */}
              <a
                href={`${process.env.REACT_APP_API_URL}/api/auth/google/login`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "11px 20px",
                  borderRadius: 12,
                  border: "1.5px solid var(--g3)",
                  background: "var(--g5)",
                  color: "var(--txt)",
                  textDecoration: "none",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  boxShadow: "0 0 0 0 rgba(95,139,76,0)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--g2)";
                  e.currentTarget.style.boxShadow =
                    "0 0 16px 2px rgba(95,139,76,0.35)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.background = "rgba(95,139,76,0.15)";
                  e.currentTarget.style.color = "var(--txt)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--g3)";
                  e.currentTarget.style.boxShadow = "0 0 0 0 rgba(95,139,76,0)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--txt)";
                }}
              >
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                </svg>
                Masuk dengan Google
              </a>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default SignInPage;
