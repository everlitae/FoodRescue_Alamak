import React from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";
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

class RegisterPage extends React.Component {
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      apiError: "",
      role: "food_provider",
      username: "",
      formError: [],
      theme: "light",
      // ── Verifikasi email ──
      showVerify: false,
      verifyEmail: "",
      otp: ["", "", "", "", "", ""],
      otpError: "",
      otpLoading: false,
      otpSuccess: false,
      resendCooldown: 0,
      // ── Form fields ──
      firstName: "",
      firstNameError: "",
      firstNameTouched: false,
      lastName: "",
      lastNameError: "",
      lastNameTouched: false,
      usernameError: "",
      usernameTouched: false,
      email: "",
      emailError: "",
      emailTouched: false,
      phone: "",
      phoneError: "",
      phoneTouched: false,
      city: "",
      customCity: "",
      cityOpen: false,
      citySearch: "",
      password: "",
      passwordStrength: 0,
      passwordLabel: "",
      confirmPassword: "",
      confirmPasswordError: "",
      confirmPasswordTouched: false,
      showPassword: false,
      showConfirmPassword: false,
      agree: false,
      agreeError: "",
      agreeTouched: false,
    };
    this.cityDropdownRef = React.createRef();
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

  validateName = (name) => /^[A-Za-z\s]+$/.test(name);
  validateUsername = (username) => /^[A-Za-z0-9_]{6,}$/.test(username);
  validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  validatePhone = (phone) => /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/.test(phone);

  handleUsernameChange = (e) =>
    this.setState({
      username: e.target.value.toLowerCase(),
      usernameError: "",
    });
  handleRoleSelect = (role) => this.setState({ role });
  handleFirstNameChange = (e) =>
    this.setState({ firstName: e.target.value, firstNameError: "" });
  handleLastNameChange = (e) =>
    this.setState({ lastName: e.target.value, lastNameError: "" });
  handleEmailChange = (e) =>
    this.setState({ email: e.target.value, emailError: "" });
  handlePhoneChange = (e) =>
    this.setState({ phone: e.target.value, phoneError: "" });
  handleCustomCityChange = (e) => this.setState({ customCity: e.target.value });

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

  handleAgreeChange = (e) =>
    this.setState({ agree: e.target.checked, agreeError: "" });

  handleSubmit = () => {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
      agree,
    } = this.state;
    let missingFields = [];

    if (!firstName) missingFields.push("Nama Depan");
    if (!lastName) missingFields.push("Nama Belakang");

    if (!this.state.username) {
      missingFields.push("Username");
    } else if (!this.validateUsername(this.state.username)) {
      this.setState({
        usernameError: "Username minimal 6 karakter (huruf/angka)",
        usernameTouched: true,
      });
      return;
    }

    if (!email) {
      missingFields.push("Email");
    } else if (!this.validateEmail(email)) {
      this.setState({
        emailError: "Format email tidak sesuai",
        emailTouched: true,
      });
      return;
    }

    if (phone && !this.validatePhone(phone)) {
      this.setState({
        phoneError: "Format nomor HP tidak sesuai",
        phoneTouched: true,
      });
      return;
    }

    if (!password) {
      missingFields.push("Password");
    } else if (password.length < 8) {
      this.setState({ formError: ["Password minimal 8 karakter"] });
      return;
    }

    if (!confirmPassword) {
      missingFields.push("Konfirmasi Password");
    } else if (password !== confirmPassword) {
      this.setState({
        confirmPasswordError: "Password tidak sesuai",
        confirmPasswordTouched: true,
      });
      return;
    }

    if (!this.state.city) {
      missingFields.push("Kota / Kabupaten");
    } else if (this.state.city === "Lainnya" && !this.state.customCity.trim()) {
      missingFields.push("Kota (Lainnya)");
    }

    if (missingFields.length > 0) {
      this.setState({
        formError: missingFields,
        agreeError: "",
        agreeTouched: false,
      });
      return;
    }

    if (!agree) {
      this.setState({
        agreeError: "Anda harus menyetujui syarat & ketentuan",
        agreeTouched: true,
        formError: [],
      });
      return;
    }

    this.setState({ formError: [] });
    this.postUser();
  };

  handleFirstNameBlur = () => {
    const { firstName } = this.state;
    this.setState({
      firstNameError:
        firstName && !this.validateName(firstName)
          ? "Nama depan hanya boleh berisi A-Z"
          : "",
      firstNameTouched: true,
    });
  };

  handleLastNameBlur = () => {
    const { lastName } = this.state;
    this.setState({
      lastNameError:
        lastName && !this.validateName(lastName)
          ? "Nama belakang hanya boleh berisi A-Z"
          : "",
      lastNameTouched: true,
    });
  };

  handleUsernameBlur = () => {
    const { username } = this.state;
    this.setState({
      usernameError:
        username && !this.validateUsername(username)
          ? "Username minimal 6 karakter (huruf/angka)"
          : "",
      usernameTouched: true,
    });
  };

  handleEmailBlur = () => {
    const { email } = this.state;
    this.setState({
      emailError:
        email && !this.validateEmail(email) ? "Format email tidak sesuai" : "",
      emailTouched: true,
    });
  };

  handlePhoneBlur = () => {
    const { phone } = this.state;
    this.setState({
      phoneError:
        phone && !this.validatePhone(phone)
          ? "Format nomor HP tidak sesuai"
          : "",
      phoneTouched: true,
    });
  };

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

  // ── POST REGISTER ─────────────────────────────────────────────────
  async postUser() {
    this.setState({ loading: true, apiError: "" });
    try {
      const res = await api.post("/auth/register", {
        first_name: this.state.firstName,
        last_name: this.state.lastName,
        email: this.state.email,
        username: this.state.username,
        phone: this.state.phone || null,
        password: this.state.password,
        role: this.state.role,
        city:
          this.state.city.trim() === "Lainnya"
            ? this.state.customCity.trim()
            : this.state.city,
      });
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
  }

  // ── COOLDOWN TIMER ────────────────────────────────────────────────
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

  // ── OTP HANDLERS ──────────────────────────────────────────────────
  handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const otp = [...this.state.otp];
    otp[index] = value.slice(-1);
    this.setState({ otp, otpError: "" });
    if (value && index < 5) this.otpRefs[index + 1].current?.focus();
  };

  handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !this.state.otp[index] && index > 0) {
      this.otpRefs[index - 1].current?.focus();
    }
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
      this.context.login(res.data.token, res.data.user, true);
      this.setState({ otpSuccess: true });
      setTimeout(() => {
        window.location.href = "/home";
      }, 2200);
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
    clearInterval(this.cooldownTimer);
  }

  render() {
    const { cityOpen, citySearch, city } = this.state;
    const filteredKota = KOTA_LIST.filter((k) =>
      k.toLowerCase().includes((citySearch || "").toLowerCase()),
    );

    // ── LAYAR VERIFIKASI OTP ──────────────────────────────────────────
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
          {/* Toast sukses — pakai class dari index.css */}
          {otpSuccess && (
            <div className="success-overlay">
              <div className="success-modal">
                <div className="success-badge">
                  <i className="bi bi-check2-circle" style={{ fontSize: 32 }} />
                </div>
                <h2 className="success-title">Email Terverifikasi!</h2>
                <p className="success-text">
                  Akun kamu sudah aktif.
                  <br />
                  Mengalihkan ke beranda...
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
              position: "relative",
            }}
          >
            {/* Glow blobs */}
            <div
              style={{
                position: "fixed",
                top: -120,
                left: -120,
                width: 400,
                height: 400,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(95,139,76,0.12) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "fixed",
                bottom: -80,
                right: -80,
                width: 320,
                height: 320,
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(184,105,74,0.10) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ width: "100%", maxWidth: 420 }}>
              {/* Logo */}
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

              {/* Card */}
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
                    { num: 3, label: "Selesai" },
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
                            fontFamily: '"Syne", sans-serif',
                            transition: "all 0.3s ease",
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
                            letterSpacing: "0.05em",
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
                            transition: "background 0.4s ease",
                            maxWidth: 60,
                          }}
                        />
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <div className="fade-in">
                  {/* Header */}
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

                  {/* OTP boxes */}
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
                            fontFamily: '"Syne", sans-serif',
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
                        style={{
                          fontSize: 12,
                          color: "#e05050",
                          marginTop: 8,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 5,
                        }}
                      >
                        <i className="bi bi-exclamation-circle" />
                        {otpError}
                      </div>
                    )}
                  </div>

                  {/* Resend */}
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

                  {/* Submit */}
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
                </div>

                {/* Back */}
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
    // ── END LAYAR VERIFIKASI ──────────────────────────────────────────

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

            <div className="mb-5">
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

            {/* Role Selector */}
            <div className="d-flex flex-column gap-1">
              <div style={{ marginBottom: "20px" }}>
                <label className="text-green3 fw-semibold mb-2">
                  PILIH PERANMU
                </label>
                <div className="role-container">
                  <div
                    className={`role-card ${this.state.role === "food_provider" ? "active-provider" : ""}`}
                    onClick={() => this.handleRoleSelect("food_provider")}
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
                    onClick={() => this.handleRoleSelect("food_seeker")}
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
            </div>

            <div className="d-flex flex-column gap-3">
              {/* Nama */}
              <div className="d-flex flex-column flex-md-row gap-3">
                <div className="flex-grow-1 d-flex flex-column gap-1">
                  <label
                    className="text-green3 fw-semibold"
                    htmlFor="namaDepan"
                  >
                    NAMA DEPAN
                  </label>
                  <div className="input-group rounded-3">
                    <input
                      type="text"
                      className={`form-control py-2 px-3 ${this.state.firstNameTouched && this.state.firstNameError ? "input-error" : "input-green"}`}
                      placeholder="John"
                      value={this.state.firstName}
                      onChange={this.handleFirstNameChange}
                      onBlur={this.handleFirstNameBlur}
                    />
                    <span className="input-group-text input-green">
                      <i className="bi bi-person"></i>
                    </span>
                  </div>
                  {this.state.firstNameTouched && this.state.firstNameError && (
                    <small className="text-danger">
                      {this.state.firstNameError}
                    </small>
                  )}
                </div>
                <div className="flex-grow-1 d-flex flex-column gap-1">
                  <label
                    className="text-green3 fw-semibold"
                    htmlFor="namaBelakang"
                  >
                    NAMA BELAKANG
                  </label>
                  <div className="input-group rounded-3">
                    <input
                      type="text"
                      className={`form-control py-2 px-3 ${this.state.lastNameTouched && this.state.lastNameError ? "input-error" : "input-green"}`}
                      placeholder="Doe"
                      value={this.state.lastName}
                      onChange={this.handleLastNameChange}
                      onBlur={this.handleLastNameBlur}
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

              {/* Username */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold">USERNAME</label>
                <div className="input-group rounded-3">
                  <input
                    type="text"
                    className={`form-control py-2 px-3 ${this.state.usernameTouched && this.state.usernameError ? "input-error" : "input-green"}`}
                    placeholder="Minimal 6 karakter"
                    value={this.state.username}
                    onChange={this.handleUsernameChange}
                    onBlur={this.handleUsernameBlur}
                  />
                  <span
                    className={`input-group-text ${this.state.usernameTouched && this.state.usernameError ? "input-error" : "input-green"}`}
                  >
                    <i className="bi bi-person"></i>
                  </span>
                </div>
                {this.state.usernameTouched && this.state.usernameError && (
                  <small className="text-danger">
                    {this.state.usernameError}
                  </small>
                )}
              </div>

              {/* Email */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold" htmlFor="email">
                  EMAIL
                </label>
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

              {/* Nomor HP */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold" htmlFor="NomorHP">
                  NOMOR HP
                </label>
                <div className="input-group rounded-3">
                  <input
                    type="tel"
                    className={`form-control py-2 px-3 ${this.state.phoneTouched && this.state.phoneError ? "input-error" : "input-green"}`}
                    placeholder="+628123456789"
                    value={this.state.phone}
                    onChange={this.handlePhoneChange}
                    onBlur={this.handlePhoneBlur}
                  />
                  <span
                    className={`input-group-text ${this.state.phoneTouched && this.state.phoneError ? "input-error" : "input-green"}`}
                  >
                    <i className="bi bi-telephone"></i>
                  </span>
                </div>
                {this.state.phoneTouched && this.state.phoneError && (
                  <small className="text-danger mt-1">
                    {this.state.phoneError}
                  </small>
                )}
              </div>

              {/* Kota */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold" htmlFor="Kota">
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
                      fontFamily: "inherit",
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
                              fontFamily: "inherit",
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
                                  transition: "background 0.15s",
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
                                    flexShrink: 0,
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
                    onChange={this.handleCustomCityChange}
                  />
                )}
              </div>

              {/* Password */}
              <div className="d-flex flex-column gap-1 rounded-3">
                <label
                  className="text-green3 fw-semibold fs-6"
                  htmlFor="password"
                >
                  PASSWORD
                </label>
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
                <div className="pw-str mt-2">
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
                    marginTop: 12,
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
              <div className="d-flex flex-column gap-1 rounded-3">
                <label
                  className="text-green3 fw-semibold fs-6"
                  htmlFor="confirmPassword"
                >
                  KONFIRMASI PASSWORD
                </label>
                <div className="input-group position-relative">
                  <input
                    type={this.state.showConfirmPassword ? "text" : "password"}
                    className={`form-control py-2 px-3 ${this.state.confirmPasswordTouched && this.state.confirmPasswordError ? "input-error" : "input-green"} pe-5`}
                    placeholder="Ulangi Password"
                    value={this.state.confirmPassword}
                    onChange={this.handleConfirmPasswordChange}
                    onBlur={this.handleConfirmPasswordBlur}
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
                    <small className="text-danger mt-1">
                      {this.state.confirmPasswordError}
                    </small>
                  )}
              </div>

              {/* Agree */}
              <div className="d-flex flex-column gap-1">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="checkDefault"
                    checked={this.state.agree}
                    onChange={this.handleAgreeChange}
                  />
                  <label
                    className="form-check-label outfit text-green3"
                    htmlFor="checkDefault"
                  >
                    Saya setuju dengan{" "}
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
                  </label>
                </div>

                {this.state.apiError && (
                  <div className="text-danger mb-3">{this.state.apiError}</div>
                )}
                {this.state.agreeTouched && this.state.agreeError && (
                  <small className="text-danger">{this.state.agreeError}</small>
                )}
                {this.state.formError.length > 0 && (
                  <div className="text-danger">
                    <small>Harap isi:</small>
                    <ul className="mb-0 ps-3">
                      {this.state.formError.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

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
                    <i className="bi bi-person-plus-fill"></i>
                    <span>Buat Akun Sekarang</span>
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

export default RegisterPage;
