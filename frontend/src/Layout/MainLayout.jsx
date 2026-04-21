import React from "react";
import { Outlet } from "react-router";

import SideBar from "../Component/SideBar.jsx";

class MainLayout extends React.Component {
    render() {
        return (
            <>
                <div className="row">
                    <div className="col-4">
                        <SideBar />
                    </div>
                    <div className="col">
                        <h1>Welcome to My App</h1>
                    </div>
                </div>
                 
            </>
        );
    }
}

export default MainLayout;