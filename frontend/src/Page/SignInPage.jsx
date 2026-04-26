import React from "react";

class SignInPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      theme: "light",
      loginError: "",
      email: "",
      emailError: "",
      emailTouched: false,
      password: "",
      passwordError: "",
      passwordTouched: false,
      showPassword: false,
    };
  }

  setTheme = () => {
    const newTheme = this.state.theme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);

    this.setState({ theme: newTheme });
  };

  validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  handleEmailChange = (e) =>
    this.setState({
      email: e.target.value,
      emailError: "",
      loginError: "",
    });

  handlePasswordChange = (e) =>
    this.setState({
      password: e.target.value,
      passwordError: "",
      passwordTouched: false,
      loginError: "",
    });

  handleEmailBlur = () => {
    const { email } = this.state;

    this.setState({
      emailError:
        email && !this.validateEmail(email) ? "Format email tidak sesuai" : "",
      emailTouched: true,
    });
  };

  handlePasswordBlur = () => {
    const { password } = this.state;
    this.setState({
      passwordError: !password ? "Password wajib diisi" : "",
      passwordTouched: true,
    });
  };

  handleSubmit = () => {
    const { email, password } = this.state;

    if (!email && !password) {
      this.setState({
        emailError: "Email wajib diisi",
        passwordError: "Password wajib diisi",
      });
      return;
    }

    if (!email) {
      this.setState({ emailError: "Email wajib diisi" });
      return;
    }

    if (!this.validateEmail(email)) {
      this.setState({ emailError: "Format email tidak sesuai" });
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
    const userInput = this.state.email;
    const passwordInput = this.state.password;

    const response = await fetch("/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user: userInput,
        password: passwordInput,
      }),
    });
    const data = await response.json();

    if (data.user) {
      alert("Login Berhasil!");
    } else {
      this.setState({
        loginError: "Email atau Password salah",
      });
    }
  }

  componentDidMount() {
    const savedTheme = localStorage.getItem("theme") || "light";

    document.documentElement.setAttribute("data-theme", savedTheme);
    this.setState({ theme: savedTheme });
  }

  render() {
    return (
      <>
        <div className="w-100 min-vh-100 h-100 d-flex flex-row">
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
              <h1 className="syne-h1">Selamat Datang Kembali 👋 </h1>
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
          <div className="col-12 col-md-6 p-5 right-signin h-100">
            <div className="d-flex flex-row align-items-center justify-content-between mb-5">
              <p
                className="outfit text-green3 fw-light back-btn"
                onClick={() => window.history.back()}
              >
                {" "}
                <i className="bi bi-arrow-left-short"></i> Kembali
              </p>

              <button className="theme-btn" onClick={this.setTheme}>
                <i
                  className={`bi ${
                    this.state.theme === "dark" ? "bi-moon-fill" : "bi-sun-fill"
                  }`}
                ></i>
              </button>
            </div>

            <div className="mb-5">
              <h3 className="syne-h1 text-green1">Masuk ke Akun</h3>
              <p className="outfit fw-light text-green3">
                Belum punya akun?{" "}
                <span
                  className="login-link"
                  onClick={() => (window.location.href = "/register")}
                >
                  Buat Gratis
                </span>
              </p>
            </div>

            <div className="d-flex flex-column gap-3">
              <div className="d-flex flex-column gap-1">
                <label className="text-green3 fw-semibold" htmlFor="email">
                  EMAIL
                </label>
                <div className="input-group rounded-3">
                  <input
                    type="email"
                    className={`form-control py-2 px-3 ${this.state.emailError ? "input-error" : "input-green"}`}
                    placeholder="johndoe@example.com"
                    value={this.state.email}
                    onChange={this.handleEmailChange}
                    onBlur={this.handleEmailBlur}
                  />
                  <span className="input-group-text input-green">
                    <i className="bi bi-envelope"></i>
                  </span>
                </div>
                {this.state.emailTouched && this.state.emailError && (
                  <small className="text-danger">{this.state.emailError}</small>
                )}
              </div>

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
                    className={`form-control py-2 px-3 ${this.state.passwordError ? "input-error" : "input-green"} pe-5`}
                    placeholder="Password"
                    value={this.state.password}
                    onChange={this.handlePasswordChange}
                    onBlur={this.handlePasswordBlur}
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
              {this.state.loginError && (
                <small className="text-danger">{this.state.loginError}</small>
              )}

              <div className="d-flex flex-row justify-content-between">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    value=""
                    id="checkDefault"
                  />
                  <label
                    className="form-check-label outfit text-green3"
                    for="checkDefault"
                  >
                    Ingat saya
                  </label>
                </div>
                <p className="outfit fw-semibold text-green3">Lupa Password?</p>
              </div>

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
