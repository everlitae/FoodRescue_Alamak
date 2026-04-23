import React from "react";

class NavBar extends React.Component {
    constructor(props){
        super(props);
    }

    setTheme(){
        const currentTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", currentTheme);
        localStorage.setItem("theme", currentTheme);
    }


    componentDidMount() {
        const savedTheme = localStorage.getItem("theme");
        if(savedTheme){
            document.documentElement.setAttribute("data-theme", savedTheme);
        }
    }

    render() {
        return(
            <>
                <div className="container-fluid d-flex flex-row align-items-center justify-content-between position-sticky z-1 p-3" style={{borderBottom: "1px solid var(--g5)", backgroundColor: "var(--surface)"}}>
                    <div className="d-flex flex-wrap align-items-center gap-3">
                        <img src="/assets/logo/foodrescue_logo_only.png" width={"45px"} height={"40px"} />
                        <div>
                            <h6 className="syne-h1 text-green3">
                                FoodRescue
                            </h6>
                            <p className="outfit text-green3">WEB PLATFORM</p>
                        </div>
                        
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-1">
                        <a href="#" className="btn-light-green py-2 px-3 rounded-2 d-flex gap-1">
                            <i className="bi bi-house-fill"></i>Home
                        </a>
                        <a href="#" className="btn-light-green py-2 px-3 rounded-2 d-flex gap-1">
                            <i className="bi bi-search"></i>Cari
                        </a>
                        <a href="#" className="btn-light-green py-2 px-3 rounded-2 d-flex gap-1">
                            <i className="bi bi-plus-circle-fill"></i>Donasi
                        </a>

                        <button className="btn btn-green-gradient" onClick={this.setTheme}><i class="bi bi-brightness-high"></i></button>

                        <button className="btn btn-green-gradient outfit fw-semibold fs-6 py-2 px-3" href="">Mulai Donasi</button>
                    </div>
                    
                    
                </div>
            </>
        );
    }
}

export default NavBar;