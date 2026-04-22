import React from "react";

class SignInPage extends React.Component {

    constructor(props) {
        super(props);
    }

    async getUser() {
        const userInput = document.getElementById("user_input").value;
        const passwordInput = document.getElementById("password_input").value;

        const response = await fetch("/api/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: userInput,
                password: passwordInput
            })  
        });
        const data = await response.json();
        
        if (data.user) {
            alert("Login Berhasil!");
        } else {
            alert("Login Gagal: " + data.message);
        }
    }

    render() {
        return (
            <>
                <div className="w-100 min-vh-100 h-100 d-flex flex-row">
                    <div className="d-none d-md-flex col-6 h-100 flex-column justify-content-between p-5 left-signin position-relative grid-detail-light text-white">
                        <div className="d-flex flex-wrap align-items-center justify-content-start gap-3">
                            <img src="/assets/logo/foodrescue_logo_only.png" width={"55px"} height={"50px"} alt="" />
                            <div>
                                <h5 className="syne-h1">FoodRescue</h5>
                                <p className="outfit"><small>WEB PLATFORM</small></p>
                            </div>
                        </div>
                        <div className="fade-in">
                            <h1 className="syne-h1">Selamat Datang Kembali 👋 </h1>
                            <p className="outfit mb-3">Masuk ke akun FoodRescue dan lanjutkan misi mulia mengurangi sisa makan bersama.</p>

                            <div className="card-transparent p-3 rounded-4">
                                <p className="outfi fw-light">"Sudah 3 tahun bergabung dan kami telah menyalurkan lebih dari 200 porsi makanan kepada yang membutuhkan"</p>
                                <p className="outfi fw-lighter"><small>Rizal Ainun Harifin - Food Provider Medan</small></p>
                            </div>
                        </div>
                        <div className="outfit fw-lighter">
                            <p>Alamak Agile IFA-Sore</p>
                        </div>
                    </div>
                    <div className="col-12 col-md-6 p-5 right-signin h-100">
                        <div className="d-flex flex-row align-items-center justify-content-between mb-5">
                            <p className="outfit text-green3 fw-light"> <i class="bi bi-arrow-left-short"></i> Kembali</p>

                            <button className="btn btn-green-gradient"><i class="bi bi-brightness-high"></i></button>
                        </div>

                        <div className="mb-5">
                            <h3 className="syne-h1 text-green1">Masuk ke Akun</h3>
                            <p className="outfit fw-light text-green3">Belum punya akun? Buat Gratis</p>
                        </div>

                        <div className="d-flex flex-column gap-3">

                            <div className="d-flex flex-column gap-1">
                                <label className="text-green3 fw-semibold" htmlFor="email">EMAIL</label>
                                <div className="input-group rounded-3">
                                    <input type="email" className="form-control py-2 px-3 input-green"  placeholder="johndoe@example.com"/> 
                                    <span className="input-group-text input-green">
                                        <i class="bi bi-envelope"></i>
                                    </span>
                                </div>
                                   
                            </div>

                            <div className="d-flex flex-column gap-1 rounded-3">
                                <label className="text-green3 fw-semibold fs-6" htmlFor="password">PASSWORD</label>
                                <div className="input-group">
                                    <input type="text" className="form-control py-2 px-3 input-green" placeholder="Password"/> 
                                    <span className="input-group-text input-green">
                                        <i class="bi bi-lock"></i>
                                    </span>
                                </div>
                                   
                            </div>

                            <div className="d-flex flex-row justify-content-between">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="" id="checkDefault"/>
                                    <label class="form-check-label outfit text-green3" for="checkDefault">
                                        Ingat saya
                                    </label>
                                </div>
                                <p className="outfit fw-semibold text-green3">Lupa Password?</p>
                            </div>
                            
                            <button className="btn btn-outline-dark py-3 fs-6 fw-bold d-flex flex-row justify-content-center gap-2 rounded-3 btn-green-gradient">
                                <i class="bi bi-box-arrow-in-right"></i> 
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