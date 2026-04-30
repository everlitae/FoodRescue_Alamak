import React, { Component } from "react";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 1, // 1: input email, 2: input OTP, 3: input new password, 4: success
      email: "",
      otp: ["", "", "", "", "", ""],
      newPassword: "",
      confirmPassword: "",
      showNewPassword: false,
      showConfirmPassword: false,
      emailError: "",
      otpError: "",
      passwordError: "",
      isLoading: false,
      resendCountdown: 0,
      otpVerified: false,
    };

    this.otpRefs = Array(6)
      .fill(null)
      .map(() => React.createRef());
    this.resendTimer = null;
  }

  componentWillUnmount() {
    if (this.resendTimer) clearInterval(this.resendTimer);
  }

  startResendCountdown() {
    this.setState({ resendCountdown: 60 });
    this.resendTimer = setInterval(() => {
      this.setState((prev) => {
        if (prev.resendCountdown <= 1) {
          clearInterval(this.resendTimer);
          return { resendCountdown: 0 };
        }
        return { resendCountdown: prev.resendCountdown - 1 };
      });
    }, 1000);
  }

  handleEmailChange = (e) => {
    this.setState({ email: e.target.value, emailError: "" });
  };

  handleEmailSubmit = async () => {
    const { email } = this.state;

    if (!email.trim()) {
      this.setState({ emailError: "Email tidak boleh kosong." });
      return;
    }

    this.setState({ isLoading: true });

    try {
      const res = await fetch("http://localhost:5000/api/otp/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      this.setState({ isLoading: false, step: 2 });
      this.startResendCountdown();
    } catch (err) {
      this.setState({ isLoading: false, emailError: err.message });
    }
  };

  handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const otp = [...this.state.otp];
    otp[index] = value.slice(-1);
    this.setState({ otp, otpError: "" });
    if (value && index < 5) {
      this.otpRefs[index + 1].current?.focus();
    }
  };

  handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !this.state.otp[index] && index > 0) {
      this.otpRefs[index - 1].current?.focus();
    }
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
    const nextIndex = Math.min(pasted.length, 5);
    this.otpRefs[nextIndex].current?.focus();
  };

  handleOtpSubmit = async () => {
    const { otp, email } = this.state;
    const otpValue = otp.join("");

    if (otpValue.length < 6) {
      this.setState({ otpError: "Masukkan 6 digit kode OTP." });
      return;
    }

    this.setState({ isLoading: true });

    try {
      const res = await fetch("http://localhost:5000/api/otp/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp: otpValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      this.setState({
        isLoading: false,
        step: 3,
        otpVerified: true,
      });
    } catch (err) {
      this.setState({
        isLoading: false,
        otpError: err.message,
      });
    }
  };

  handleResend = async () => {
    const { email, resendCountdown } = this.state;

    // 🔴 Cegah klik saat countdown masih jalan
    if (resendCountdown > 0) return;

    // 🔴 Validasi email
    if (!email) {
      alert("Email tidak ditemukan");
      return;
    }

    this.setState({
      otp: ["", "", "", "", "", ""],
      otpError: "",
      isLoading: true,
    });

    try {
      const res = await fetch("http://localhost:5000/api/otp/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      this.setState({ isLoading: false });
      this.startResendCountdown(); // 🔁 mulai ulang countdown
    } catch (err) {
      console.error(err);
      this.setState({
        isLoading: false,
        otpError: "Gagal mengirim ulang OTP",
      });
    }
  };

  getPasswordStrength(password) {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const map = [
      { label: "Sangat Lemah", color: "#e05050" },
      { label: "Lemah", color: "#ff7070" },
      { label: "Cukup", color: "#f0b429" },
      { label: "Kuat", color: "#7aaf60" },
      { label: "Sangat Kuat", color: "#5f8b4c" },
    ];
    return { score, ...map[score] };
  }

  handlePasswordSubmit = async () => {
    const { newPassword, confirmPassword, email } = this.state;

    if (!newPassword) {
      this.setState({ passwordError: "Password baru tidak boleh kosong." });
      return;
    }

    if (newPassword.length < 8) {
      this.setState({ passwordError: "Password minimal 8 karakter." });
      return;
    }

    if (newPassword !== confirmPassword) {
      this.setState({ passwordError: "Konfirmasi password tidak cocok." });
      return;
    }

    this.setState({ isLoading: true });

    try {
      const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
          otpVerified: this.state.otpVerified,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg);

      this.setState({ isLoading: false, step: 4 });
    } catch (err) {
      this.setState({
        isLoading: false,
        passwordError: err.message,
      });
    }
  };

  renderStepIndicator() {
    const { step } = this.state;
    const steps = [
      { num: 1, label: "Email" },
      { num: 2, label: "Verifikasi" },
      { num: 3, label: "Password Baru" },
    ];
    return (
      <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
        {steps.map((s, i) => (
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
                    step > s.num
                      ? "var(--g1)"
                      : step === s.num
                        ? "linear-gradient(135deg, var(--g1), var(--g2))"
                        : "var(--surf2)",
                  color: step >= s.num ? "#fff" : "var(--txt4)",
                  border:
                    step === s.num
                      ? "2px solid var(--g2)"
                      : "2px solid transparent",
                  boxShadow: step === s.num ? "0 0 0 4px var(--g4)" : "none",
                }}
              >
                {step > s.num ? <i className="bi bi-check" /> : s.num}
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: step >= s.num ? "var(--txt2)" : "var(--txt4)",
                  transition: "color 0.3s ease",
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  marginBottom: 18,
                  background:
                    step > s.num
                      ? "linear-gradient(90deg, var(--g1), var(--g2))"
                      : "var(--border)",
                  borderRadius: 2,
                  transition: "background 0.4s ease",
                  maxWidth: 60,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  renderStep1() {
    const { email, emailError, isLoading } = this.state;
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, var(--g1), var(--g2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(95,139,76,0.35)",
            }}
          >
            <i
              className="bi bi-envelope-at-fill"
              style={{ fontSize: 28, color: "#fff" }}
            />
          </div>
          <h2
            className="syne-h1"
            style={{ fontSize: 22, color: "var(--txt)", marginBottom: 6 }}
          >
            Lupa Password?
          </h2>
          <p style={{ fontSize: 13, color: "var(--txt3)", lineHeight: 1.7 }}>
            Masukkan email yang terdaftar. Kami akan mengirimkan kode verifikasi
            ke email kamu.
          </p>
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--txt2)" }}
          >
            Alamat Email
          </label>
          <div className="input-group">
            <span
              className="input-group-text"
              style={{
                background: "var(--g5)",
                border: "1px solid var(--border)",
                borderRight: "none",
                color: "var(--txt4)",
              }}
            >
              <i className="bi bi-envelope" />
            </span>
            <input
              type="email"
              className={`form-control input-green ${emailError ? "input-error" : ""}`}
              placeholder="contoh@email.com"
              value={email}
              onChange={this.handleEmailChange}
              onKeyDown={(e) => e.key === "Enter" && this.handleEmailSubmit()}
              style={{ borderLeft: "none" }}
            />
          </div>
          {emailError && (
            <div
              style={{
                fontSize: 12,
                color: "var(--error-color)",
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <i className="bi bi-exclamation-circle" />
              {emailError}
            </div>
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
          onClick={this.handleEmailSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <span className="spinner-border spinner-border-sm" />
              Mengirim...
            </span>
          ) : (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-send-fill" />
              Kirim Kode Verifikasi
            </span>
          )}
        </button>
      </div>
    );
  }

  renderStep2() {
    const { otp, otpError, isLoading, resendCountdown, email } = this.state;
    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, var(--cr1), var(--cr2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(148,80,52,0.35)",
            }}
          >
            <i
              className="bi bi-shield-lock-fill"
              style={{ fontSize: 28, color: "#fff" }}
            />
          </div>
          <h2
            className="syne-h1"
            style={{ fontSize: 22, color: "var(--txt)", marginBottom: 6 }}
          >
            Cek Email Kamu
          </h2>
          <p style={{ fontSize: 13, color: "var(--txt3)", lineHeight: 1.7 }}>
            Kami mengirimkan kode 6 digit ke{" "}
            <span style={{ fontWeight: 700, color: "var(--txt2)" }}>
              {email}
            </span>
          </p>
        </div>

        <div className="mb-4">
          <label
            className="form-label text-center d-block"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--txt2)" }}
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
                onChange={(e) => this.handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => this.handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? this.handleOtpPaste : undefined}
                style={{
                  width: 46,
                  height: 54,
                  textAlign: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  fontFamily: '"Syne", sans-serif',
                  borderRadius: 12,
                  border: `2px solid ${digit ? "var(--g2)" : "var(--border)"}`,
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
                color: "var(--error-color)",
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

        <div className="text-center mb-3">
          <span style={{ fontSize: 13, color: "var(--txt3)" }}>
            Tidak menerima kode?{" "}
          </span>
          {resendCountdown > 0 ? (
            <span
              style={{ fontSize: 13, color: "var(--txt4)", fontWeight: 600 }}
            >
              Kirim ulang dalam {resendCountdown}s
            </span>
          ) : (
            <span
              className="login-link text-cream1"
              onClick={this.handleResend}
              style={{
                cursor:
                  this.state.resendCountdown > 0 ? "not-allowed" : "pointer",
                opacity: this.state.resendCountdown > 0 ? 0.5 : 1,
              }}
            >
              {this.state.resendCountdown > 0
                ? `Kirim ulang dalam ${this.state.resendCountdown}s`
                : "Kirim Ulang"}
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
          onClick={this.handleOtpSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <span className="spinner-border spinner-border-sm" />
              Memverifikasi...
            </span>
          ) : (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-check2-circle" />
              Verifikasi Kode
            </span>
          )}
        </button>
      </div>
    );
  }

  renderStep3() {
    const {
      newPassword,
      confirmPassword,
      showNewPassword,
      showConfirmPassword,
      passwordError,
      isLoading,
    } = this.state;
    const strength = this.getPasswordStrength(newPassword);
    const strengthWidths = ["0%", "25%", "50%", "75%", "100%"];

    return (
      <div className="fade-in">
        <div className="text-center mb-4">
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "linear-gradient(135deg, var(--g1), var(--g2))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
              boxShadow: "0 8px 24px rgba(95,139,76,0.35)",
            }}
          >
            <i
              className="bi bi-key-fill"
              style={{ fontSize: 28, color: "#fff" }}
            />
          </div>
          <h2
            className="syne-h1"
            style={{ fontSize: 22, color: "var(--txt)", marginBottom: 6 }}
          >
            Buat Password Baru
          </h2>
          <p style={{ fontSize: 13, color: "var(--txt3)", lineHeight: 1.7 }}>
            Pastikan password baru kamu kuat dan mudah diingat.
          </p>
        </div>
        <div className="mb-3">
          <label
            className="form-label"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--txt2)" }}
          >
            Password Baru
          </label>
          <div className="input-group position-relative">
            <span
              className="input-group-text"
              style={{
                background: "var(--g5)",
                border: "1px solid var(--border)",
                borderRight: "none",
                color: "var(--txt4)",
              }}
            >
              <i className="bi bi-lock" />
            </span>
            <input
              type={showNewPassword ? "text" : "password"}
              className={`form-control input-green ${passwordError ? "input-error" : ""}`}
              placeholder="Minimal 8 karakter"
              value={newPassword}
              onChange={(e) =>
                this.setState({
                  newPassword: e.target.value,
                  passwordError: "",
                })
              }
              style={{ borderLeft: "none", paddingRight: 48 }}
            />
            <span
              className="eye-inside"
              style={{ right: 14 }}
              onClick={() =>
                this.setState((p) => ({ showNewPassword: !p.showNewPassword }))
              }
            >
              <i
                className={`bi ${showNewPassword ? "bi-eye-slash" : "bi-eye"}`}
              />
            </span>
          </div>

          {newPassword && (
            <div style={{ marginTop: 8 }}>
              <div className="pw-str">
                <div
                  className="pw-fill"
                  style={{
                    width: strengthWidths[strength.score],
                    background: strength.color,
                  }}
                />
              </div>
              <div className="pw-hint" style={{ color: strength.color }}>
                {strength.label}
              </div>
            </div>
          )}
        </div>

        <div className="mb-3">
          <label
            className="form-label"
            style={{ fontSize: 13, fontWeight: 600, color: "var(--txt2)" }}
          >
            Konfirmasi Password
          </label>
          <div className="input-group position-relative">
            <span
              className="input-group-text"
              style={{
                background: "var(--g5)",
                border: "1px solid var(--border)",
                borderRight: "none",
                color: "var(--txt4)",
              }}
            >
              <i className="bi bi-lock-fill" />
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              className={`form-control input-green ${passwordError ? "input-error" : ""}`}
              placeholder="Ulangi password baru"
              value={confirmPassword}
              onChange={(e) =>
                this.setState({
                  confirmPassword: e.target.value,
                  passwordError: "",
                })
              }
              onKeyDown={(e) =>
                e.key === "Enter" && this.handlePasswordSubmit()
              }
              style={{ borderLeft: "none", paddingRight: 48 }}
            />
            <span
              className="eye-inside"
              style={{ right: 14 }}
              onClick={() =>
                this.setState((p) => ({
                  showConfirmPassword: !p.showConfirmPassword,
                }))
              }
            >
              <i
                className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
              />
            </span>
          </div>

          {confirmPassword && (
            <div
              style={{
                fontSize: 12,
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                gap: 5,
                color:
                  newPassword === confirmPassword
                    ? "var(--g1)"
                    : "var(--error-color)",
              }}
            >
              <i
                className={`bi ${
                  newPassword === confirmPassword
                    ? "bi-check-circle"
                    : "bi-x-circle"
                }`}
              />
              {newPassword === confirmPassword
                ? "Password cocok"
                : "Password tidak cocok"}
            </div>
          )}

          {passwordError && (
            <div
              style={{
                fontSize: 12,
                color: "var(--error-color)",
                marginTop: 5,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <i className="bi bi-exclamation-circle" />
              {passwordError}
            </div>
          )}
        </div>

        <div
          className="card-green"
          style={{ borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}
        >
          <p
            style={{
              fontSize: 11,
              color: "var(--txt3)",
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            <i className="bi bi-lightbulb me-1" /> Tips password yang kuat:
          </p>
          {[
            {
              icon: "bi-check2",
              text: "Minimal 8 karakter",
              met: newPassword.length >= 8,
            },
            {
              icon: "bi-check2",
              text: "Mengandung huruf kapital",
              met: /[A-Z]/.test(newPassword),
            },
            {
              icon: "bi-check2",
              text: "Mengandung angka",
              met: /[0-9]/.test(newPassword),
            },
            {
              icon: "bi-check2",
              text: "Mengandung karakter spesial",
              met: /[^A-Za-z0-9]/.test(newPassword),
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

        <button
          className="btn btn-green-gradient w-100 outfit"
          style={{
            padding: "12px",
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 12,
          }}
          onClick={this.handlePasswordSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <span className="spinner-border spinner-border-sm" />
              Menyimpan...
            </span>
          ) : (
            <span className="d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-shield-check" />
              Simpan Password Baru
            </span>
          )}
        </button>
      </div>
    );
  }

  renderStep4() {
    return (
      <div className="fade-in text-center">
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: "linear-gradient(135deg, var(--g1), var(--g2))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            boxShadow: "0 12px 36px rgba(95,139,76,0.40)",
            animation: "popIn 0.4s ease",
          }}
        >
          <i
            className="bi bi-check-lg"
            style={{ fontSize: 38, color: "#fff" }}
          />
        </div>

        <div
          className="badge-green mb-3 mx-auto"
          style={{ display: "inline-flex", border: "none" }}
        >
          <i className="bi bi-stars" /> Password Berhasil Diperbarui
        </div>

        <h2
          className="syne-h1"
          style={{ fontSize: 24, color: "var(--txt)", marginBottom: 8 }}
        >
          Selamat! 🎉
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--txt3)",
            lineHeight: 1.8,
            marginBottom: 28,
          }}
        >
          Password kamu telah berhasil diperbarui. Sekarang kamu bisa masuk
          menggunakan password baru.
        </p>

        <div
          className="card-green"
          style={{
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          <div className="d-flex align-items-center gap-2 mb-1">
            <i className="bi bi-info-circle" style={{ color: "var(--g1)" }} />
            <span
              style={{ fontSize: 12, fontWeight: 700, color: "var(--txt2)" }}
            >
              Keamanan akun
            </span>
          </div>
          <p
            style={{
              fontSize: 12,
              color: "var(--txt3)",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Untuk keamanan, semua sesi login lainnya telah dikeluarkan secara
            otomatis.
          </p>
        </div>

        <button
          className="btn btn-green-gradient w-100 outfit"
          style={{
            padding: "12px",
            fontSize: 14,
            fontWeight: 700,
            borderRadius: 12,
            marginBottom: 10,
          }}
          onClick={() => (window.location.href = "/login")}
        >
          <span className="d-flex align-items-center justify-content-center gap-2">
            <i className="bi bi-box-arrow-in-right" />
            Masuk Sekarang
          </span>
        </button>
      </div>
    );
  }

  render() {
    const { step } = this.state;

    return (
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
          <div className="text-center mb-4">
            <div
              className="syne-h1"
              style={{
                fontSize: 26,
                background: "linear-gradient(135deg, var(--g1), var(--cr2))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 4,
              }}
            >
              <img
                src="/assets/logo/foodrescue_logo_only.png"
                alt="Food Rescue"
                style={{
                  width: 50,
                  marginRight: 8,
                  marginTop: -8,
                }}
              />
              FoodRescue
            </div>
            <p style={{ fontSize: 12, color: "var(--txt4)" }}>
              Reset akun kamu dengan mudah
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
            {step < 4 && this.renderStepIndicator()}
            {step === 1 && this.renderStep1()}
            {step === 2 && this.renderStep2()}
            {step === 3 && this.renderStep3()}
            {step === 4 && this.renderStep4()}
            {step < 4 && (
              <div className="text-center mt-3">
                <span
                  className="back-btn"
                  onClick={() => (window.location.href = "/login")}
                >
                  <i className="bi bi-arrow-left me-1" />
                  Kembali ke Login
                </span>
              </div>
            )}
          </div>

          <p
            className="text-center mt-3"
            style={{ fontSize: 11, color: "var(--txt4)" }}
          >
            © 2026 FoodRescue · Semua hak dilindungi
          </p>
        </div>
      </div>
    );
  }
}

export default ForgotPassword;
