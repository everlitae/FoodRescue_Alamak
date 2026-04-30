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
    };
  }

  setTheme = () => {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    this.setState({ theme: newTheme });
  };

  // Validasi: bisa berupa email atau username (min 3 karakter)
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
    // Kirim sebagai field 'email' ke backend (backend sudah handle email/username)
    const email = this.state.identifier.trim().toLowerCase();
    const password = this.state.password;

    try {
      const res = await api.post("/auth/login", { email, password });
      this.context.login(res.data.token, res.data.user, this.state.rememberMe);
      this.setState({ redirect: true });
    } catch (err) {
      this.setState({
        loginError: err.response?.data?.msg || "Login gagal",
      });
    }
  }

  componentDidMount() {
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
                className="btn btn-outline-dark py-3 fs-6 fw-bold d-flex flex-row justify-content-center gap-2 rounded-3 btn-green-gradient"
              >
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Masuk Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
}

export default SignInPage;
