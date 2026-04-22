import React from "react";

class NavBar extends React.Component {
    constructor(props){
        super(props);
    }

    render() {
        return(
            <>
                <div className="container-fluid d-flex flex-row text-bg-white align-items-center justify-content-between p-3" style={{borderBottom: "1px solid var(--g4)"}}>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <img src="/assets/logo/foodrescue_logo_only.png" width={"45px"} height={"40px"} />
                        <div>
                            <h4 className="syne-h1 text-green3">
                                FoodRescue
                            </h4>
                            <p className="outfit text-green3">WEB PLATFORM</p>
                        </div>
                        
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-1">
                        <a href="#" className="btn-light-green py-2 px-3 rounded-2 d-flex gap-2">
                            <i className="bi bi-house-fill"></i>Home
                        </a>
                        <a href="#" className="btn-light-green py-2 px-3 rounded-2 d-flex gap-2">
                            <i className="bi bi-search"></i>Cari
                        </a>
                        <a href="#" className="btn-light-green py-2 px-3 rounded-2 d-flex gap-2">
                            <i className="bi bi-plus-circle-fill"></i>Donasi
                        </a>
                        <button className="btn btn-green-gradient outfit fw-semibold fs-6 py-2 px-3" href="">Mulai Donasi</button>
                    </div>
                    
                    
                </div>
            </>
        );
    }
}

export default NavBar;