import React from "react";

class SideBar extends React.Component {
    render() {
        return (
            <>
                <div style={{height: "100vh", boxShadow: "0 0 10px rgba(0,0,0,0.1)"}}>
                    <div className="d-none d-md-block px-4">
                        <h1 className="px-1 pt-3">FoodRescue</h1>
                        <hr />
                        <div className="d-flex flex-column gap-1">
                            <a className="btn btn-sidebar text-start py-3" href="#"><span>Home</span></a>
                            <a className="btn btn-sidebar text-start py-3" href="#"><span>About</span></a>
                            <a className="btn btn-sidebar text-start py-3" href="#"><span>Services</span></a>
                            <a className="btn btn-sidebar text-start py-3" href="#"><span>Contact</span></a>

                        </div>
                    </div>

                    <div className="d-block d-md-none">
                        <button className="btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target=".sidebar">
                            Toggle Sidebar
                        </button>
                        <div className="collapse collapse-horizontal sidebar">
                            <div className="d-flex flex-column gap-2 sidebar">
                                <a className="btn btn-outline-dark" href="#">Home</a>
                                <a className="btn btn-outline-dark" href="#">About</a>
                                <a className="btn btn-outline-dark" href="#">Services</a>
                                <a className="btn btn-outline-dark" href="#">Contact</a>
                            </div>
                        </div>
                    </div>
                    
    
                </div>
                
            </>
            
        );
    } 
}

export default SideBar;