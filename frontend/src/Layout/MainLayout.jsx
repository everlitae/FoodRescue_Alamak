import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "../Component/NavBar.jsx";
import Footer from "../Component/Footer.jsx";
import ToastNotification from "../Component/ToastNotification.jsx";

class MainLayout extends React.Component {
  render() {
    return (
      <>
        <div className="position-relative grid-detail-responsive main-bg-color">
          <NavBar />
          <ToastNotification />
          <Outlet />
          <Footer />
        </div>
      </>
    );
  }
}

export default MainLayout;
