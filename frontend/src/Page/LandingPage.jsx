import React from "react";
import FeatureListCard from "../Component/Small/FeatureListCard";
import ExampleFoodCard from "../Component/ExampleFoodCard";

class LandingPage extends React.Component{
    constructor(props){
        super(props);
        this.featuresData = [
            {
                number: "01",
                icon: "👤",
                title: "Manajemen Pengguna",
                description: "Sistem akun lengkap dengan peran berbeda sesuai kebutuhan pengguna.",
                features: [
                "Registrasi & login/logout",
                "Profil yang dapat diedit",
                "Donor & Receiver",
                "Rating kepercayaan"
                ]
            },
            {
                number: "02",
                icon: "🍱",
                title: "Donasi Makanan",
                description: "Buat postingan donasi dengan detail lengkap dan foto makanan.",
                features: [
                "Upload foto makanan",
                "Kategori & jumlah makanan",
                "Batas waktu (deadline)",
                "Lokasi pengambilan"
                ]
            },
            {
                number: "03",
                icon: "🔄",
                title: "Interaksi & Transaksi",
                description: "Klaim donasi, pantau status, dan komunikasi antar pengguna.",
                features: [
                "Klaim donasi makanan",
                "Status: Available / Claimed / Completed",
                "Chat donor & penerima",
                "Pencarian & filter"
                ]
            },
            {
                number: "04",
                icon: "📊",
                title: "Riwayat & Tracking",
                description: "Pantau semua aktivitas donasi secara transparan dan akurat.",
                features: [
                "Riwayat donasi diberikan/diterima",
                "Tracking donasi diklaim",
                "Laporan kadaluarsa",
                "Sistem rating pengguna"
                ]
            },
            {
                number: "05",
                icon: "🛠️",
                title: "Admin Panel",
                description: "Dashboard pengelolaan platform dengan statistik lengkap.",
                features: [
                "Login admin terpisah",
                "Manajemen pengguna & postingan",
                "Statistik real-time",
                "Monitoring aktivitas"
                ]
            }
        ];
    }



    render(){
        return(
            <>
                <div className="main-bg-color min-vh-100 h-100 position-relative grid-detail-responsive">
                    <div className="container-md position-relative py-5 px-4 px-md-5">

                        <div className="col-12 col-md-8 pe-5 pe-md-0">
                            <h1 className="syne-h1 text-green1 mb-2">Selamatkan<br/>Makanan,<br/> Nyalakan Harapan</h1>

                            <p className="outfit text-green3 mt-4" style={{paddingRight: "200px"}}>Platform digital yang mengurangi pemborosan makanan (food waste) dengan menghubungkan donatur dan penerima - lebih cepat, terorganisir dan berdampak.</p>

                            <button className="btn-green-gradient d-flex flex-row gap-2 py-3 px-5 rounded-3 fw-bold my-4"><i className="bi bi-gift-fill"></i>Donasikan Sekarang</button>

                            <div className="rounded-4 px-5 py-3 d-inline-flex flex-wrap gap-5" style={{backgroundColor:"var(--surface)", border:"1px solid var(--border)"}}>
                                <div className="d-flex flex-column align-items-start justify-content-center text-green3">
                                    <h3 className="syne-h1">2.4K+</h3>
                                    <p className="office fw-lighter"><small>DONASI AKTIF</small></p>
                                </div>

                                <span style={{border: "1px solid var(--g5)"}}>

                                </span>
                                <div className="d-flex flex-column align-items-start justify-content-center text-green3">
                                    <h3 className="syne-h1">800+</h3>
                                    <p className="office fw-lighter"><small>RELAWAN</small></p>
                                </div>

                                <span style={{border: "1px solid var(--g5)"}}></span>

                                <div className="d-flex flex-column align-items-start justify-content-center text-green3">
                                    <h3 className="syne-h1">42</h3>
                                    <p className="office fw-lighter"><small>KOTA</small></p>
                                </div>
                            </div>
                        </div>
                        
                    </div>
                    
                    <div className="position-relative py-5 px-4 px-md-5" style={{backgroundColor: "var(--surf2)"}}>
                        <div className="container-md">
                            <p className="outfit fw-semibold text-green3">FITUR UTAMA</p>
                            <h1 className="syne-h1 col-12 col-md-4 my-3 text-green1">Semua yang kamu butuhkan <span className="text-green4">dalam satu platform</span></h1>
                            <p className="outfit text-green3 col-12 col-md-4 mb-5">Dari manajemen akun hingga chat - dirancang lengkap untuk kebutuhan ekosistem donasi makan yang efisien</p>

                            <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center">

                                {this.featuresData.map((card, index) => (
                                    <FeatureListCard index={card.number} emoticon={card.icon} title={card.title} description={card.description} listFeature={card.features}/>
                                ))}

                            </div>
                        </div>
                    </div>
                    
                    <div className="container-md position-relative py-5 px-4 px-md-5">
                        <p className="outfit text-green3 fw-bold" style={{fontSize:"smaller"}}>DONASI AKTIF</p>
                        <h1 className="syne-h1 text-green1">Klaim atau buat <span className="text-green4">donasi anda</span></h1>
                        <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mt-3">
                            <ExampleFoodCard foodname="Nasi & Lauk Pauk"/>
                            <ExampleFoodCard foodname="Nasi & Lauk Pauk"/>
                            <ExampleFoodCard foodname="Nasi & Lauk Pauk"/>
                            <ExampleFoodCard foodname="Nasi & Lauk Pauk"/>
                        </div>
                        
                    </div>
                    
                    <div className="left-signin ">
                        <div className="position-relative py-5 px-4 px-md-5 d-flex flex-row gap-5">
                            <div className="flex-fill">
                                <p className="outfit text-green3 fw-bold" style={{fontSize:"smaller"}}>DAMPAK NYATA</p>

                                <h1 className="syne-h1 text-white col-12 col-md-8">Setiap gram punya arti</h1>

                                <p className="text-light mb-3 col-12 col-md-8">Bersama komunitas FoodRescue, kita membangun ekosistem berbagi yang berkelanjutan</p>

                                <button className="btn-white py-2 px-4 fw-bold rounded-3">Bergabung sekarang</button>
                            </div>
                            <div className="flex-fill d-flex justify-content-center align-items-center px-md-5">
                                <div className="row row-cols-2 g-3">
                                    <div className="col">
                                        <div className="card-transparent d-flex flex-column justify-content-center align-items-start p-3 rounded-4 text-white">
                                            <h3 className="syne-h1">12.4T</h3>
                                            <p className="outfit" style={{fontSize:"small"}}>kg makanan terselamatkan</p>
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="card-transparent d-flex flex-column justify-content-center align-items-start p-3 rounded-4 text-white">
                                            <h3 className="syne-h1">42</h3>
                                            <p className="outfit text-center" style={{fontSize:"small"}}>Kota yang terjangkau</p>
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="card-transparent d-flex flex-column justify-content-center align-items-start p-3 rounded-4 text-white">
                                            <h3 className="syne-h1">800+</h3>
                                            <p className="outfit text-center" style={{fontSize:"small"}}>Donatur aktif</p>
                                        </div>
                                    </div>

                                    <div className="col">
                                        <div className="card-transparent d-flex flex-column justify-content-center align-items-start p-3 rounded-4 text-white">
                                            <h3 className="syne-h1">8K+</h3>
                                            <p className="outfit text-center" style={{fontSize:"small"}}>Penerima manfaat</p>
                                        </div>
                                    </div>
                                    
                                    
                                </div>
                            </div>
                            
                            
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default LandingPage;