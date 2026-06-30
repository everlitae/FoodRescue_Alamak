import React from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

class RegisterPage extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      apiError: "",
      theme: "light",
      // Form fields
      email: "",
      emailError: "",
      emailTouched: false,
      password: "",
      passwordStrength: 0,
      passwordLabel: "",
      confirmPassword: "",
      confirmPasswordError: "",
      confirmPasswordTouched: false,
      showPassword: false,
      showConfirmPassword: false,
      // OTP
      showVerify: false,
      verifyEmail: "",
      otp: ["", "", "", "", "", ""],
      otpError: "",
      otpLoading: false,
      otpSuccess: false,
      resendCooldown: 0,
    };
    this.cooldownTimer = null;
    this.otpRefs = Array(6)
      .fill(null)
      .map(() => React.createRef());
  }

  setTheme = () => {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    this.setState({ theme: newTheme });
  };

  validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  handleEmailChange = (e) =>
    this.setState({ email: e.target.value, emailError: "" });
  handleEmailBlur = () => {
    const { email } = this.state;
    this.setState({
      emailError:
        email && !this.validateEmail(email) ? "Format email tidak sesuai" : "",
      emailTouched: true,
    });
  };

  handlePasswordChange = (e) => {
    const value = e.target.value;
    const result = this.checkPasswordStrength(value);
    this.setState({
      password: value,
      passwordStrength: result.strength,
      passwordLabel: result.label,
      confirmPasswordError:
        this.state.confirmPassword && value !== this.state.confirmPassword
          ? "Password tidak sesuai"
          : "",
    });
  };

  handleConfirmPasswordChange = (e) =>
    this.setState({
      confirmPassword: e.target.value,
      confirmPasswordError: "",
    });

  handleConfirmPasswordBlur = () => {
    const { password, confirmPassword } = this.state;
    this.setState({
      confirmPasswordError:
        confirmPassword && password !== confirmPassword
          ? "Password tidak sesuai"
          : "",
      confirmPasswordTouched: true,
    });
  };

  togglePassword = () =>
    this.setState({ showPassword: !this.state.showPassword });
  toggleConfirmPassword = () =>
    this.setState({ showConfirmPassword: !this.state.showConfirmPassword });

  checkPasswordStrength = (password) => {
    if (password.length > 0 && password.length < 8)
      return { strength: 10, label: "Terlalu pendek" };
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    const label =
      strength === 0
        ? "Masukkan password"
        : strength <= 25
          ? "Lemah"
          : strength <= 50
            ? "Cukup"
            : strength <= 75
              ? "Kuat"
              : "Sangat kuat";
    return { strength, label };
  };

  handleSubmit = async () => {
    const { email, password, confirmPassword } = this.state;

    if (!email) {
      this.setState({ emailError: "Email wajib diisi", emailTouched: true });
      return;
    }
    if (!this.validateEmail(email)) {
      this.setState({
        emailError: "Format email tidak sesuai",
        emailTouched: true,
      });
      return;
    }
    if (!password) {
      this.setState({ apiError: "Password wajib diisi" });
      return;
    }
    if (password.length < 8) {
      this.setState({ apiError: "Password minimal 8 karakter" });
      return;
    }
    if (!confirmPassword) {
      this.setState({
        confirmPasswordError: "Konfirmasi password wajib diisi",
        confirmPasswordTouched: true,
      });
      return;
    }
    if (password !== confirmPassword) {
      this.setState({
        confirmPasswordError: "Password tidak sesuai",
        confirmPasswordTouched: true,
      });
      return;
    }

    this.setState({ loading: true, apiError: "" });
    try {
      const res = await api.post("/auth/register", { email, password });
      this.setState({
        showVerify: true,
        verifyEmail: res.data.email,
        resendCooldown: 60,
        otp: ["", "", "", "", "", ""],
      });
      this.startCooldown();
    } catch (err) {
      this.setState({
        apiError:
          err.response?.data?.msg || "Server error / API tidak terhubung",
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  startCooldown = () => {
    clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      this.setState((prev) => {
        if (prev.resendCooldown <= 1) {
          clearInterval(this.cooldownTimer);
          return { resendCooldown: 0 };
        }
        return { resendCooldown: prev.resendCooldown - 1 };
      });
    }, 1000);
  };

  handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const otp = [...this.state.otp];
    otp[index] = value.slice(-1);
    this.setState({ otp, otpError: "" });
    if (value && index < 5) this.otpRefs[index + 1].current?.focus();
  };

  handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !this.state.otp[index] && index > 0)
      this.otpRefs[index - 1].current?.focus();
    if (e.key === "Enter") this.handleVerifyOtp();
  };

  handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const otp = [...this.state.otp];
    pasted.split("").forEach((char, i) => {
      otp[i] = char;
    });
    this.setState({ otp });
    this.otpRefs[Math.min(pasted.length, 5)].current?.focus();
  };

  handleVerifyOtp = async () => {
    const otpValue = this.state.otp.join("");
    if (otpValue.length < 6) {
      this.setState({ otpError: "Masukkan 6 digit kode OTP" });
      return;
    }
    this.setState({ otpLoading: true, otpError: "" });
    try {
      const res = await api.post("/auth/verify-email", {
        email: this.state.verifyEmail,
        otp: otpValue,
      });
      // Simpan token dulu, redirect ke complete-profile
      this.context.login(res.data.token, res.data.user, true);
      this.setState({ otpSuccess: true });
      setTimeout(() => {
        window.location.href = "/complete-profile";
      }, 2000);
    } catch (err) {
      this.setState({
        otpError: err.response?.data?.msg || "Verifikasi gagal",
      });
    } finally {
      this.setState({ otpLoading: false });
    }
  };

  handleResendOtp = async () => {
    if (this.state.resendCooldown > 0) return;
    this.setState({ otpError: "", otpLoading: true });
    try {
      await api.post("/auth/resend-verify-otp", {
        email: this.state.verifyEmail,
      });
      this.setState({ resendCooldown: 60, otp: ["", "", "", "", "", ""] });
      this.startCooldown();
      setTimeout(() => this.otpRefs[0].current?.focus(), 50);
    } catch (err) {
      this.setState({
        otpError: err.response?.data?.msg || "Gagal mengirim ulang OTP",
      });
    } finally {
      this.setState({ otpLoading: false });
    }
  };

  componentDidMount() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    this.setState({ theme: savedTheme });
  }

  componentWillUnmount() {
    clearInterval(this.cooldownTimer);
  }

  render() {
    // ── LAYAR OTP ──────────────────────────────────────────────────────
    if (this.state.showVerify) {
      const {
        verifyEmail,
        otp,
        otpError,
        otpLoading,
        otpSuccess,
        resendCooldown,
      } = this.state;
      const otpComplete = otp.join("").length === 6;

      return (
        <>
          {otpSuccess && (
            <div className="success-overlay">
              <div className="success-modal">
                <div className="success-badge">
                  <i className="bi bi-check2-circle" style={{ fontSize: 32 }} />
                </div>
                <h2 className="success-title">Email Terverifikasi!</h2>
                <p className="success-text">
                  Melengkapi profil kamu...
                  <br />
                  Sebentar lagi...
                </p>
                <div
                  className="spinner-border spinner-border-sm"
                  style={{ color: "var(--g2)" }}
                />
              </div>
            </div>
          )}
          <div
            className="main-bg-color grid-detail-responsive"
            style={{
              minHeight: "100vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 16px",
            }}
          >
            <div style={{ width: "100%", maxWidth: 420 }}>
              <div className="text-center mb-4">
                <div
                  className="syne-h1"
                  style={{
                    fontSize: 26,
                    background:
                      "linear-gradient(135deg, var(--g1), var(--cr2))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    marginBottom: 4,
                  }}
                >
                  <img
                    src="/assets/logo/foodrescue_logo_only.png"
                    alt=""
                    style={{ width: 50, marginRight: 8, marginTop: -8 }}
                  />
                  FoodRescue
                </div>
                <p style={{ fontSize: 12, color: "var(--txt4)" }}>
                  Satu langkah lagi untuk bergabung
                </p>
              </div>

              <div
                className="card-basic"
                style={{
                  borderRadius: 20,
                  padding: "32px 28px",
                  boxShadow: "var(--shadow2)",
                }}
              >
                {/* Stepper */}
                <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
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
                              s.num === 1
                                ? "var(--g1)"
                                : s.num === 2
                                  ? "linear-gradient(135deg, var(--g1), var(--g2))"
                                  : "var(--surf2)",
                            color: s.num <= 2 ? "#fff" : "var(--txt4)",
                            border:
                              s.num === 2
                                ? "2px solid var(--g2)"
                                : "2px solid transparent",
                            boxShadow:
                              s.num === 2 ? "0 0 0 4px var(--g4)" : "none",
                          }}
                        >
                          {s.num === 1 ? <i className="bi bi-check" /> : s.num}
                        </div>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: s.num <= 2 ? "var(--txt2)" : "var(--txt4)",
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
                              s.num < 2
                                ? "linear-gradient(90deg, var(--g1), var(--g2))"
                                : "var(--border)",
                            maxWidth: 60,
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="text-center mb-4">
                  <div
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 18,
                      background:
                        "linear-gradient(135deg, var(--g1), var(--g2))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 16px",
                      boxShadow: "0 8px 24px rgba(95,139,76,0.35)",
                    }}
                  >
                    <i
                      className="bi bi-envelope-check-fill"
                      style={{ fontSize: 28, color: "#fff" }}
                    />
                  </div>
                  <h2
                    className="syne-h1"
                    style={{
                      fontSize: 22,
                      color: "var(--txt)",
                      marginBottom: 6,
                    }}
                  >
                    Cek Email Kamu
                  </h2>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--txt3)",
                      lineHeight: 1.7,
                    }}
                  >
                    Kami mengirimkan kode 6 digit ke{" "}
                    <span style={{ fontWeight: 700, color: "var(--txt2)" }}>
                      {verifyEmail}
                    </span>
                  </p>
                </div>

                <div className="mb-4">
                  <label
                    className="form-label text-center d-block"
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--txt2)",
                    }}
                  >
                    Masukkan Kode OTP
                  </label>
                  <div className="d-flex justify-content-center gap-2">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={this.otpRefs[i]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          this.handleOtpChange(i, e.target.value)
                        }
                        onKeyDown={(e) => this.handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? this.handleOtpPaste : undefined}
                        autoFocus={i === 0}
                        style={{
                          width: 46,
                          height: 54,
                          textAlign: "center",
                          fontSize: 22,
                          fontWeight: 800,
                          borderRadius: 12,
                          border: `2px solid ${otpError ? "#e05050" : digit ? "var(--g2)" : "var(--border)"}`,
                          background: digit ? "var(--g5)" : "var(--surface)",
                          color: "var(--txt)",
                          outline: "none",
                          transition: "all 0.2s ease",
                          boxShadow: digit ? "0 0 0 3px var(--g4)" : "none",
                        }}
                      />
                    ))}
                  </div>
                  {otpError && (
                    <div
                      className="text-center"
                      style={{ fontSize: 12, color: "#e05050", marginTop: 8 }}
                    >
                      <i className="bi bi-exclamation-circle me-1" />
                      {otpError}
                    </div>
                  )}
                </div>

                <div className="text-center mb-3">
                  <span style={{ fontSize: 13, color: "var(--txt3)" }}>
                    Tidak menerima kode?{" "}
                  </span>
                  {resendCooldown > 0 ? (
                    <span
                      style={{
                        fontSize: 13,
                        color: "var(--txt4)",
                        fontWeight: 600,
                      }}
                    >
                      Kirim ulang dalam {resendCooldown}s
                    </span>
                  ) : (
                    <span
                      className="login-link text-cream1"
                      onClick={this.handleResendOtp}
                      style={{
                        cursor: "pointer",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      Kirim Ulang
                    </span>
                  )}
                </div>

                <button
                  className="btn btn-green-gradient w-100 outfit"
                  style={{
                    padding: "12px",
                    fontSize: 14,
                    fontWeight: 700,
                    borderRadius: 12,
                  }}
                  onClick={this.handleVerifyOtp}
                  disabled={otpLoading || !otpComplete}
                >
                  {otpLoading ? (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <span className="spinner-border spinner-border-sm" />
                      Memverifikasi...
                    </span>
                  ) : (
                    <span className="d-flex align-items-center justify-content-center gap-2">
                      <i className="bi bi-check2-circle" />
                      Verifikasi Email
                    </span>
                  )}
                </button>

                <div className="text-center mt-3">
                  <span
                    className="back-btn"
                    onClick={() =>
                      this.setState({
                        showVerify: false,
                        otp: ["", "", "", "", "", ""],
                        otpError: "",
                      })
                    }
                  >
                    <i className="bi bi-arrow-left me-1" />
                    Kembali ke form pendaftaran
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    // ── FORM REGISTER ─────────────────────────────────────────────────
    return (
      <>
        <div className="w-100 min-vh-100 h-100 d-flex flex-row">
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
                Bergabung & Buat Dampak{" "}
                <span style={{ color: "var(--cr3)" }}>Nyata</span>
              </h1>
              <p className="outfit mb-3">
                Daftarkan dirimu sebagai Food Provider atau Food Seeker. Bersama
                kita kurangi pemborosan makanan di Indonesia
              </p>
              <div className="d-flex flex-wrap gap-5">
                <div className="d-flex flex-column align-items-start justify-content-center">
                  <h3 className="syne-h1">2.4K+</h3>
                  <p className="office fw-lighter">
                    <small>DONASI AKTIF</small>
                  </p>
                </div>
                <div className="d-flex flex-column align-items-start justify-content-center">
                  <h3 className="syne-h1">800+</h3>
                  <p className="office fw-lighter">
                    <small>RELAWAN</small>
                  </p>
                </div>
                <div className="d-flex flex-column align-items-start justify-content-center">
                  <h3 className="syne-h1">42</h3>
                  <p className="office fw-lighter">
                    <small>KOTA</small>
                  </p>
                </div>
              </div>
            </div>
            <div className="outfit fw-lighter">
              <p>Alamak Agile IFA-Sore</p>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-12 col-md-6 p-5 right-signin h-100 overflow-auto">
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

            <div className="mb-4">
              <h3 className="syne-h1 text-green1">Buat Akun Baru</h3>
              <p className="outfit fw-light text-green3">
                Sudah punya akun?{" "}
                <Link
                  to="/login"
                  className="outfit fw-semibold text-green3 login-link"
                  style={{ textDecoration: "none" }}
                >
                  Masuk di sini
                </Link>
              </p>
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Google OAuth */}
              <a
                href={`${process.env.REACT_APP_API_URL}/api/auth/google/register`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  padding: "11px 20px",
                  borderRadius: 12,
                  border: "1.5px solid var(--g3)",
                  background: "transparent",
                  color: "var(--txt)",
                  textDecoration: "none",
                  fontFamily: "inherit",
                  fontSize: 14,
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--g2)";
                  e.currentTarget.style.boxShadow =
                    "0 0 16px 2px rgba(95,139,76,0.35)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.color = "var(--txt)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--g3)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
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
                Daftar dengan Google
              </a>

              {/* Divider */}
              <div className="d-flex align-items-center gap-2">
                <hr
                  className="flex-grow-1 m-0"
                  style={{ borderColor: "var(--border)" }}
                />
                <span
                  className="outfit fw-light"
                  style={{ fontSize: 12, color: "var(--txt4)" }}
                >
                  atau daftar dengan email
                </span>
                <hr
                  className="flex-grow-1 m-0"
                  style={{ borderColor: "var(--border)" }}
                />
              </div>

              {/* Email */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold">EMAIL</label>
                <div className="input-group rounded-3">
                  <input
                    type="email"
                    className={`form-control py-2 px-3 ${this.state.emailTouched && this.state.emailError ? "input-error" : "input-green"}`}
                    placeholder="johndoe@example.com"
                    value={this.state.email}
                    onChange={this.handleEmailChange}
                    onBlur={this.handleEmailBlur}
                  />
                  <span
                    className={`input-group-text ${this.state.emailTouched && this.state.emailError ? "input-error" : "input-green"}`}
                  >
                    <i className="bi bi-envelope"></i>
                  </span>
                </div>
                {this.state.emailTouched && this.state.emailError && (
                  <small className="text-danger">{this.state.emailError}</small>
                )}
              </div>

              {/* Password */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold">PASSWORD</label>
                <div className="input-group position-relative">
                  <input
                    type={this.state.showPassword ? "text" : "password"}
                    className="form-control py-2 px-3 input-green pe-5"
                    placeholder="Minimal 8 karakter"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                  />
                  <i
                    className={`bi ${this.state.showPassword ? "bi-eye-slash" : "bi-eye"} eye-inside`}
                    onClick={this.togglePassword}
                  />
                  <span className="input-group-text input-green">
                    <i className="bi bi-lock"></i>
                  </span>
                </div>
                <div className="pw-str mt-1">
                  <div
                    className="pw-fill"
                    style={{
                      width: `${this.state.passwordStrength}%`,
                      background:
                        this.state.passwordStrength === 0
                          ? "var(--g3)"
                          : this.state.passwordLabel === "Terlalu pendek"
                            ? "var(--sa1)"
                            : this.state.passwordStrength <= 25
                              ? "var(--sa2)"
                              : this.state.passwordStrength <= 50
                                ? "var(--cr3)"
                                : this.state.passwordStrength <= 75
                                  ? "var(--g2)"
                                  : "#198754",
                    }}
                  />
                </div>
                <div className="pw-hint">{this.state.passwordLabel}</div>
                <div
                  className="card-green"
                  style={{
                    borderRadius: 12,
                    padding: "12px 16px",
                    marginTop: 8,
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: "var(--txt3)",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    <i className="bi bi-lightbulb me-1" /> Tips password yang
                    kuat:
                  </p>
                  {[
                    {
                      text: "Minimal 8 karakter",
                      met: this.state.password.length >= 8,
                    },
                    {
                      text: "Mengandung huruf kapital",
                      met: /[A-Z]/.test(this.state.password),
                    },
                    {
                      text: "Mengandung angka",
                      met: /[0-9]/.test(this.state.password),
                    },
                    {
                      text: "Mengandung karakter spesial",
                      met: /[^A-Za-z0-9]/.test(this.state.password),
                    },
                  ].map((tip, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 11,
                        color: tip.met ? "var(--g1)" : "var(--txt4)",
                        marginBottom: 2,
                      }}
                    >
                      <i
                        className={`bi ${tip.met ? "bi-check-circle-fill" : "bi-circle"}`}
                      />
                      {tip.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold">
                  KONFIRMASI PASSWORD
                </label>
                <div className="input-group position-relative">
                  <input
                    type={this.state.showConfirmPassword ? "text" : "password"}
                    className={`form-control py-2 px-3 ${this.state.confirmPasswordTouched && this.state.confirmPasswordError ? "input-error" : "input-green"} pe-5`}
                    placeholder="Ulangi password"
                    value={this.state.confirmPassword}
                    onChange={this.handleConfirmPasswordChange}
                    onBlur={this.handleConfirmPasswordBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") this.handleSubmit();
                    }}
                  />
                  <i
                    className={`bi ${this.state.showConfirmPassword ? "bi-eye-slash" : "bi-eye"} eye-inside`}
                    onClick={this.toggleConfirmPassword}
                  />
                  <span
                    className={`input-group-text ${this.state.confirmPasswordTouched && this.state.confirmPasswordError ? "input-error" : "input-green"}`}
                  >
                    <i className="bi bi-lock"></i>
                  </span>
                </div>
                {this.state.confirmPasswordTouched &&
                  this.state.confirmPasswordError && (
                    <small className="text-danger">
                      {this.state.confirmPasswordError}
                    </small>
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
                    Memproses...
                  </>
                ) : (
                  <>
                    <i className="bi bi-envelope-fill"></i>
                    <span>Daftar dengan Email</span>
                  </>
                )}
              </button>

              <p
                className="outfit fw-light text-green3 text-center"
                style={{ fontSize: 12 }}
              >
                Dengan mendaftar, kamu menyetujui{" "}
                <Link
                  to="/terms-and-condition"
                  className="outfit fw-semibold text-green3 login-link"
                  style={{ textDecoration: "none" }}
                >
                  Syarat Ketentuan
                </Link>{" "}
                dan{" "}
                <Link
                  to="/privacy-policy"
                  className="outfit fw-semibold text-green3 login-link"
                  style={{ textDecoration: "none" }}
                >
                  Kebijakan Privasi
                </Link>
              </p>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default RegisterPage;
