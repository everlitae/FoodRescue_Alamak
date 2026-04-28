import React from "react";
import { Link } from "react-router";
import { withRouter } from "../Wrapper/withRouter";

class NavBar extends React.Component {
    constructor(props){
        super(props);
        this.state={
            theme: document.documentElement.getAttribute("data-theme")
        }
    }

    setTheme = () => {
        const newTheme = this.state.theme === "dark" ? "light" : "dark";

        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("theme", newTheme);

        this.setState({ theme: newTheme });
    };

    componentDidMount() {
        const savedTheme = localStorage.getItem("theme");
        if(savedTheme){
            document.documentElement.setAttribute("data-theme", savedTheme);
        }
    }

    render() {
        const isProvider = this.props.auth.user?.role === "food_provider";

        return(
            <>
                <div className="container-fluid d-flex flex-row align-items-center justify-content-between sticky-top z-100 p-3" style={{borderBottom: "1px solid var(--g5)", backgroundColor: "var(--surface)"}}>
                    <div className="d-flex flex-wrap align-item-center gap-2">

                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <img src="/assets/logo/foodrescue_logo_only.png" width={"35px"} height={"30px"} />
                            <div>
                                <p className="syne-h1 text-green3">
                                    FoodRescue
                                </p>
                                <p className="outfit text-green3" style={{fontSize:"smaller"}}>WEB PLATFORM</p>
                            </div>
                        </div>

                        <div className="d-flex flex-wrap align-items-center gap-1">
                            <Link className="btn-light-green py-2 px-3 rounded-2" to="/donations">
                                <i className="d-inline d-md-none bi bi-box-seam"></i>
                                <p className="d-none d-md-inline">Donasi</p>
                            </Link>

                            {this.props.auth.user && (
                                <>
                                    <Link className="btn-light-green py-2 px-3 rounded-2" to="/history">
                                        <i className="d-inline d-md-none bi bi-clock-history"></i>
                                        <p className="d-none d-md-inline">Riwayat</p>
                                    </Link>

                                    <Link className="btn-light-green py-2 px-3 rounded-2" to="/messages">
                                        <i className="d-inline d-md-none bi bi-chat-dots"></i>
                                        <p className="d-none d-md-inline">Pesan</p>
                                    </Link>

                                    <Link className="btn-light-green py-2 px-3 rounded-2" to="/community">
                                        <i className="d-inline d-md-none bi bi-people"></i>
                                        <p className="d-none d-md-inline">Komunitas</p>
                                    </Link>

                                    {this.props.auth.user.role === "admin" && (
                                        <Link className="btn-light-green py-2 px-3 rounded-2" to="/admin">
                                            <p className="">Admin</p>
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                        
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-1">
                        {this.props.auth.user ? (
                            <>
                                {
                                    isProvider && (
                                        <Link className="btn-light-green py-2 px-3 rounded-2" to="/donations/create">
                                            <i className="d-inline d-md-none bi bi-plus-circle"></i>
                                            <p className="d-none d-md-inline">Buat Donasi</p>
                                        </Link>
                                    )
                                }
                                <Link className="d-flex flex-wrap gap-2 text-decoration-none text-green1" to="/profile">
                                    <i className="bi bi-person-circle me-1"></i>
                                        <p>{this.props.auth.user.first_name} {this.props.auth.user.last_name}</p>

                                        <span className="badge-green rounded-5 px-2 py-1 fw-semibold" style={{fontSize:"small"}}>
                                            {
                                                this.props.auth.user.role === "food_provider" ? '🍱 Provider' : this.props.auth.user.role === "admin ?" ? '⚙️ Admin' : '🤲 Seeker'
                                            }
                                        </span>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link className="btn-light-green py-2 px-3 rounded-2" to="/login">
                                    <p className="">Sign In</p>
                                </Link>
                                <Link className="btn-green-gradient py-2 px-3 rounded-2" to="/register">
                                    <p className="">Register</p>
                                </Link>
                            </>
                        )
                        }

                        <button className="theme-btn ms-2" onClick={this.setTheme}>
                            <i
                            className={`bi ${
                                this.state.theme === "dark" ? "bi-moon-fill" : "bi-sun-fill"
                            }`}
                            ></i>
                        </button>

                        
                    </div>
                    
                    
                </div>
            </>
        );
    }
}

export default withRouter(NavBar);