import React from "react";
import { Outlet } from "react-router";

import NavBar from "../Component/NavBar.jsx";

class MainLayout extends React.Component {
    render() {
        return (
            <>
                <NavBar/>
                <Outlet/>
            </>
        );
    }
}

export default MainLayout;