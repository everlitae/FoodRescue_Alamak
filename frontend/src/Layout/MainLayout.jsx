import React from "react";
import { Outlet } from "react-router";

import NavBar from "../Component/NavBar.jsx";

class MainLayout extends React.Component {
    render() {
        return (
            <>
                <div className="position-relative">
                    <NavBar/>
                    <Outlet/>
                </div>
                
            </>
        );
    }
}

export default MainLayout;