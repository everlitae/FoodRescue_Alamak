import React from "react";
import { Outlet, Link } from "react-router";

const BgImageStyle = {
    backgroundImage: "url(/assets/image/hutan2.jpg)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
};

const BackGroundStyle = {
    backgroundColor: "#945034",
};

class SignInRegisterLayout extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            isRegister: false,
            isSignIn: true,
        };
    }

    handleSignIn = () => {
        this.setState({
            isRegister: false,
            isSignIn: true
        });
    }

    handleRegister = () => {
        this.setState({
            isRegister: true,
            isSignIn: false
        });
    }


    render() {
        return (
            <>
                <div className="container-fluid vh-100 p-0 d-flex align-items-center justify-content-center" style={BackGroundStyle}>
                   <div className="row g-0 w-75 h-75 rounded-5 shadow">
                        <div className="col-6 rounded-start-5 d-flex flex-column align-items-end justify-content-center pe-3 ps-5 text-end text-white" style={BgImageStyle}>
                            <h1>FREEFOOD</h1>
                            <p>Join our community and enjoy delicious food!</p>
                        </div>
                        <div className="col-6 position-relative bg-white rounded-end-5">
                            <div className="d-flex flex-row align-items-center justify-content-end pe-5">
                                <Link className="btn-forestgreen px-3 pt-2 pb-3 rounded-bottom-4 text-center" to="/user/register" onClick={this.handleRegister}>
                                    Register
                                </Link>
                                <Link className="btn-forestgreen px-3 pt-2 pb-3 rounded-bottom-4 text-center" to="/user/signin" onClick={this.handleSignIn}>
                                    Sign In
                                </Link>
                            </div>
                            <div className="position-absolute top-50 start-50 translate-middle w-100 p-4">
                                <Outlet />
                            </div>
                            
                        </div>
                    </div> 
                </div>
                
            </>
        );
    }
}

export default SignInRegisterLayout;