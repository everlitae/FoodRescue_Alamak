import React from "react";

class RegisterCard extends React.Component {
    render() {
        return (
            <>
                <div className="container-fluid h-100 w-100 d-flex flex-column align-items-start justify-content-center">
                    
                    <h1>Register</h1>
                    <form className="d-flex flex-column align-items-start justify-content-center gap-3 w-100">
                        <input type="email" className="form-control" placeholder="Email" />
                        <input type="text" className="form-control" placeholder="Username" />
                        <input type="password" className="form-control" placeholder="Password" />
                        <input type="password" className="form-control" placeholder="Confirm Password" />
                        <button type="submit" className="btn btn-primary">Register</button>
                    </form>

                </div>
            </>
        );
    }   
}

export default RegisterCard;