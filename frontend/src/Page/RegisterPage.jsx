import React from "react";

class RegisterPage extends React.Component {
    constructor(props){
        super(props);
    }

    setTheme(){
        const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", currentTheme);
        localStorage.setItem("theme", currentTheme);
    }

    async postUser() {
        const emailInp = document.getElementById("email_input").value
        const usernameInp = document.getElementById("username_input").value
        const passwordInp = document.getElementById("password_input").value
        const confirmPasswordInp = document.getElementById("confirm_password_input").value

        if (passwordInp === confirmPasswordInp) {
            const res = await fetch("/api/users/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "NIK": "Placeholder NIK",
                    "full_name": "Placeholder Full Name",
                    "email": emailInp,
                    "username": usernameInp,
                    "password": passwordInp,
                    "address": "Placeholder Address",
                    "birthdate": new Date(),
                    "current_employment": "Unemployed",
                    "salary": 1000000,
                    "marriage_status": "Single",
                    "created_at": new Date(),
                    "updated_at": new Date()
                })    
            })
            const data = await res.json()

            console.log(data)
            if (res.status === 201) {
                alert("Login Berhasil!");
            } else {
                alert("Login Gagal: " + data.message);
            }
        }
    }

    componentDidMount() {
        const savedTheme = localStorage.getItem("theme");
        if(savedTheme){
            document.documentElement.setAttribute("data-theme", savedTheme);
        }
    }

    render() {
        return (
            <>
                <div className="w-100 min-vh-100 h-100 d-flex flex-row">
                    <div className="d-none d-md-flex col-6 h-100 flex-column justify-content-between p-5 left-signin position-relative grid-detail text-white">
                        <div className="d-flex flex-wrap align-items-center justify-content-start gap-3">
                            <img src="/assets/logo/foodrescue_logo_only.png" width={"55px"} height={"50px"} alt="" />
                            <div>
                                <h5 className="syne-h1">FoodRescue</h5>
                                <p className="outfit"><small>WEB PLATFORM</small></p>
                            </div>
                        </div>
                        <div className="fade-in">
                            <h1 className="syne-h1">Bergabung & Buat Dampak <span style={{color: "var(--cr3)"}}>Nyata</span></h1>
                            <p className="outfit mb-3">Daftarkan dirimu sebagai Food Provider atau Food Seeker. Bersama kita kurangi pemborosan makanan di Indonesia</p>

                            <div className="d-flex flex-wrap gap-5">
                                <div className="d-flex flex-column align-items-start justify-content-center">
                                    <h3 className="syne-h1">2.4K+</h3>
                                    <p className="office fw-lighter"><small>DONASI AKTIF</small></p>
                                </div>
                                <div className="d-flex flex-column align-items-start justify-content-center">
                                    <h3 className="syne-h1">800+</h3>
                                    <p className="office fw-lighter"><small>RELAWAN</small></p>
                                </div>
                                <div className="d-flex flex-column align-items-start justify-content-center">
                                    <h3 className="syne-h1">42</h3>
                                    <p className="office fw-lighter"><small>KOTA</small></p>
                                </div>
                            </div>
                        </div>
                        <div className="outfit fw-lighter">
                            <p>Alamak Agile IFA-Sore</p>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 p-5 right-signin h-100 overflow-auto">
                        <div className="d-flex flex-row align-items-center justify-content-between mb-5">
                            <p className="outfit text-green3 fw-light"> <i class="bi bi-arrow-left-short"></i> Kembali</p>

                            <button className="btn btn-green-gradient" onClick={this.setTheme}><i className="bi bi-brightness-high"></i></button>
                        </div>

                        <div className="mb-5">
                            <h3 className="syne-h1 text-green1">Buat Akun Baru</h3>
                            <p className="outfit fw-light text-green3">Sudah punya akun? Masuk di sini</p>
                        </div>

                        <div className="d-flex flex-column gap-3">
                            
                            <div className="d-flex flex-column flex-md-row gap-3">
                                <div className="flex-grow-1 d-flex flex-column gap-1">
                                    <label className="text-green3 fw-semibold" htmlFor="email">NAMA DEPAN</label>
                                    <div className="input-group rounded-3">
                                        <input type="email" className="form-control py-2 px-3 input-green"  placeholder="John"/> 
                                        <span className="input-group-text input-green">
                                            <i className="bi bi-envelope"></i>
                                        </span>
                                    </div>  
                                </div>

                                <div row-1 className="flex-grow-1 d-flex flex-column gap-1">
                                    <label className="text-green3 fw-semibold" htmlFor="namaBelakang">NAMA BELAKANG</label>
                                    <div className="input-group rounded-3">
                                        <input type="email" className="form-control py-2 px-3 input-green"  placeholder="Doe"/> 
                                        <span className="input-group-text input-green">
                                            <i className="bi bi-envelope"></i>
                                        </span>
                                    </div>  
                                </div>
                            </div>
                            
                            <div className="d-flex flex-column gap-1">
                                <label className="text-green3 fw-semibold" htmlFor="email">EMAIL</label>
                                <div className="input-group rounded-3">
                                    <input type="email" className="form-control py-2 px-3 input-green"  placeholder="johndoe@example.com"/> 
                                    <span className="input-group-text input-green">
                                        <i className="bi bi-envelope"></i>
                                    </span>
                                </div>  
                            </div>

                            <div className="d-flex flex-column gap-1">
                                <label className="text-green3 fw-semibold" htmlFor="email">NOMOR HP</label>
                                <div className="input-group rounded-3">
                                    <input type="tel" className="form-control py-2 px-3 input-green"  placeholder="+62 813 130 5243"/> 
                                    <span className="input-group-text input-green">
                                        <i className="bi bi-telephone"></i>
                                    </span>
                                </div>  
                            </div>

                            <div className="d-flex flex-column gap-1">
                                <label className="text-green3 fw-semibold" htmlFor="email">KOTA / KABUPATEN</label>
                                <div className="input-group rounded-3">
                                    <select className="form-select input-green py-2 px-3" id="">
                                        <option value="">Pilih Kota...</option>
                                        <option value="Medan">Medan</option>
                                        <option value="Jakarta">Jakarta</option>
                                        <option value="Surabaya">Surabaya</option>
                                        <option value="Palembang">Palembang</option>
                                    </select>
                                    <span className="input-group-text input-green">
                                        <i className="bi bi-building"></i>
                                    </span>
                                </div>  
                            </div>

                            <div className="d-flex flex-column gap-1 rounded-3">
                                <label className="text-green3 fw-semibold fs-6" htmlFor="password">PASSWORD</label>
                                <div className="input-group">
                                    <input type="text" className="form-control py-2 px-3 input-green" placeholder="Password"/> 
                                    <span className="input-group-text input-green">
                                        <i className="bi bi-lock"></i>
                                    </span>
                                </div> 
                            </div>

                            <div className="d-flex flex-column gap-1 rounded-3">
                                <label className="text-green3 fw-semibold fs-6" htmlFor="password">KONFIRMASI PASSWORD</label>
                                <div className="input-group">
                                    <input type="text" className="form-control py-2 px-3 input-green" placeholder="Password"/> 
                                    <span className="input-group-text input-green">
                                        <i className="bi bi-lock"></i>
                                    </span>
                                </div> 
                            </div>

                            <div className="d-flex flex-row justify-content-between">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" value="" id="checkDefault"/>
                                    <label className="form-check-label outfit text-green3" for="checkDefault">
                                        Saya setuju dengan Syarat Ketentuan dan Kebijakan Privasi
                                    </label>
                                </div>
                            </div>
                            
                            <button className="btn btn-outline-dark py-3 fs-6 fw-bold d-flex flex-row justify-content-center gap-2 rounded-3 btn-green-gradient">
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