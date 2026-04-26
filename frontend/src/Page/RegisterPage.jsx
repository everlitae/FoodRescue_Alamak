import React from "react";

class RegisterPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formError: "",
            theme: "light",
            firstName: "",
            firstNameError: "",
            firstNameTouched: false,
            lastName: "",
            lastNameError: "",
            lastNameTouched: false,
            email: "",
            emailError: "",
            emailTouched: false,
            phone: "",
            phoneError: "",
            phoneTouched: false,
            city: "",
            customCity: "",
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
    }

    setTheme = () => {
        const newTheme = this.state.theme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);

        this.setState({ theme: newTheme });
    };

    validateName = (name) => /^[A-Za-z\s]+$/.test(name);

    validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    validatePhone = (phone) => /^(?:\+62|62|0)8[1-9][0-9]{6,10}$/.test(phone);

    handleFirstNameChange = (e) =>
        this.setState({ firstName: e.target.value, firstNameError: "" });

    handleLastNameChange = (e) =>
        this.setState({ lastName: e.target.value, lastNameError: "" });

    handleEmailChange = (e) =>
        this.setState({ email: e.target.value, emailError: "" });

    handlePhoneChange = (e) =>
        this.setState({ phone: e.target.value, phoneError: "" });

    handleCityChange = (e) => this.setState({ city: e.target.value, customCity: "" });

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

    handleAgreeChange = (e) => {
        this.setState({
            agree: e.target.checked,
            agreeError: "",
        });
    };

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
        if (!email) missingFields.push("Email");
        if (!phone) missingFields.push("Nomor HP");
        if (!password) missingFields.push("Password");
        if (!confirmPassword) missingFields.push("Konfirmasi Password");

        if (!this.state.city) {
            missingFields.push("Kota / Kabupaten");
        } else if (this.state.city === "Lainnya" && !this.state.customCity) {
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
                formError: "",
            });
            return;
        }

        this.setState({ formError: "" });
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
                    ? "Nama depan hanya boleh berisi A-Z"
                    : "",
            lastNameTouched: true,
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
        if (password.length > 0 && password.length < 8) {
            return { strength: 10, label: "Terlalu pendek" };
        }

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
        const emailInp = this.state.email;
        const passwordInp = this.state.password;
        const confirmPasswordInp = this.state.confirmPassword;
        const usernameInp = `${this.state.firstName} ${this.state.lastName}`;
        const cityFinal =
            this.state.city === "Lainnya" ? this.state.customCity : this.state.city;

        if (passwordInp === confirmPasswordInp) {
            const res = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    NIK: "Placeholder NIK",
                    full_name: "Placeholder Full Name",
                    email: emailInp,
                    username: usernameInp,
                    password: passwordInp,
                    address: "Placeholder Address",
                    birthdate: new Date(),
                    current_employment: "Unemployed",
                    salary: 1000000,
                    marriage_status: "Single",
                    created_at: new Date(),
                    updated_at: new Date(),
                }),
            });
            const data = await res.json();

            console.log(data);
            if (res.status === 201) {
                alert("Register Berhasil!");
            } else {
                alert("Register Gagal: " + data.message);
            }
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
                                    className={`bi ${this.state.theme === "dark" ? "bi-moon-fill" : "bi-sun-fill"
                                        }`}
                                ></i>
                            </button>
                        </div>

                        <div className="mb-5">
                            <h3 className="syne-h1 text-green1">Buat Akun Baru</h3>
                            <p className="outfit fw-light text-green3">
                                Sudah punya akun?{" "}
                                <span
                                    className="login-link"
                                    onClick={() => (window.location.href = "/login")}
                                >
                                    Masuk di sini
                                </span>
                            </p>
                        </div>

                        <div className="d-flex flex-column gap-3">
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

                                <div row-1 className="flex-grow-1 d-flex flex-column gap-1">
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
                                {this.state.emailError && (
                                    <small className="text-danger">{this.state.emailError}</small>
                                )}
                            </div>

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

                            <div className="d-flex flex-column gap-1">
                                <label className="text-green3 fw-semibold" htmlFor="Kota">
                                    KOTA / KABUPATEN
                                </label>
                                <div className="input-group rounded-3">
                                    <select
                                        className="form-select input-green py-2 px-3"
                                        value={this.state.city}
                                        onChange={this.handleCityChange}
                                    >
                                        <option value="">Pilih Kota...</option>
                                        <option value="Medan">Medan</option>
                                        <option value="Jakarta">Jakarta</option>
                                        <option value="Surabaya">Surabaya</option>
                                        <option value="Palembang">Palembang</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                    <span className="input-group-text input-green">
                                        <i className="bi bi-geo-alt"></i>
                                    </span>
                                </div>
                                {this.state.city === "Lainnya" && (
                                    <input
                                        type="text"
                                        className="form-control input-green mt-2"
                                        placeholder="Masukkan kota..."
                                        value={this.state.customCity}
                                        onChange={this.handleCustomCityChange}
                                    />
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
                            </div>

                            <div className="d-flex flex-column gap-1 rounded-3">
                                <label
                                    className="text-green3 fw-semibold fs-6"
                                    htmlFor="password"
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