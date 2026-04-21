import React from "react";

class SignInCard extends React.Component {

    constructor(props) {
        super(props);
    }

    async getUser() {
        const userInput = document.getElementById("user_input").value;
        const passwordInput = document.getElementById("password_input").value;

        const response = await fetch("/api/users/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user: userInput,
                password: passwordInput
            })  
        });
        const data = await response.json();
        
        if (data.user) {
            alert("Login Berhasil!");
        } else {
            alert("Login Gagal: " + data.message);
        }
    }

    render() {
        return (
            <>
                <div className="container-fluid h-100 w-100 d-flex flex-column align-items-start justify-content-center">
                    
                    <h1>Sign In</h1>
                    <form className="d-flex flex-column align-items-start justify-content-center gap-3 w-100">
                        <input type="text" className="form-control" placeholder="Username or Email" id="user_input" />
                        <input type="password" className="form-control" placeholder="Password" id="password_input" />
                        <button type="submit" className="btn btn-primary">Sign In</button>
                    </form>

                </div>
            </>
        );
    }   
}

export default SignInCard;