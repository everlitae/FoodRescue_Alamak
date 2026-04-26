import React from "react";
import { Outlet } from "react-router";

import NavBar from "../Component/NavBar.jsx";
import Footer from "../Component/Footer.jsx";

class MainLayout extends React.Component {
    render() {
        return (
            <>
                <div className="position-relative grid-detail-responsive main-bg-color">
                    <NavBar/>
                    <Outlet/>
                    <Footer/>
                </div>
                
            </>
        );
    }
}

export default MainLayout;