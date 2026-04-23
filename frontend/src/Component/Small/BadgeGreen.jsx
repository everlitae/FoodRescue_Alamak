import React from "react";

class BadgeGreen extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
            <span className="badge-green rounded-5 px-2 py-1 fw-semibold">
                <i class="bi bi-dot"></i>
                {this.props.message}
            </span>
        );
    }
}

export default BadgeGreen;