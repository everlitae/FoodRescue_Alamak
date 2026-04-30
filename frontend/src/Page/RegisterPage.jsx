import React from "react";
import api from "../utils/api";
import { Link } from "react-router-dom";

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
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      showSuccess: false,
      apiError: "",
      role: "food_provider",
      username: "",
      formError: [],
      theme: "light",
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

  handleRoleChange = (e) => this.setState({ role: e.target.value });
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
    let confirmError = "";
    if (this.state.confirmPassword && value !== this.state.confirmPassword) {
      confirmError = "Password tidak sesuai";
    }
    this.setState({
      password: value,
      passwordStrength: result.strength,
      passwordLabel: result.label,
      confirmPasswordError: confirmError,
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
      localStorage.setItem("token", res.data.token);
      this.setState({ showSuccess: true });
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (err) {
      console.error(err);
      this.setState({
        apiError:
          err.response?.data?.msg || "Server error / API tidak terhubung",
      });
    } finally {
      this.setState({ loading: false });
    }
  }

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
  }

  render() {
    const { cityOpen, citySearch, city } = this.state;

    const filteredKota = KOTA_LIST.filter((k) =>
      k.toLowerCase().includes((citySearch || "").toLowerCase()),
    );

    return (
      <>
        {this.state.showSuccess && (
          <div className="success-overlay">
            <div className="success-modal">
              <div className="success-badge">🎉</div>
              <h2 className="success-title">Yay Register Berhasil!</h2>
              <p className="success-text">Akun kamu sudah siap digunakan</p>
              <button
                className="success-btn"
                onClick={() => (window.location.href = "/login")}
              >
                Lanjut ke Login →
              </button>
            </div>
          </div>
        )}

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

            {this.state.apiError && (
              <div className="text-danger mb-3">{this.state.apiError}</div>
            )}

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

              {/* Kota — Custom Dropdown */}
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold" htmlFor="Kota">
                  KOTA / KABUPATEN
                </label>

                <div
                  style={{ position: "relative" }}
                  ref={this.cityDropdownRef}
                >
                  {/* Trigger */}
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

                  {/* Dropdown Panel */}
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
                      {/* Search */}
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

                      {/* List */}
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

                {/* Input custom kota */}
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
                  ></i>
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
                  ></div>
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
                  ></i>
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
                    Saya setuju dengan Syarat Ketentuan dan Kebijakan Privasi
                  </label>
                </div>
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
                className="btn btn-outline-dark py-3 fs-6 fw-bold d-flex flex-row justify-content-center gap-2 rounded-3 btn-green-gradient"
              >
                <i className="bi bi-person-plus-fill"></i>
                <span>Buat Akun Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default RegisterPage;
