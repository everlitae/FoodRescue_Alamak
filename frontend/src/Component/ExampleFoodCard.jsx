import React from "react";
import BadgeGreen from "./Small/BadgeGreen";

class ExampleFoodCard extends React.Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className="card-gradient-green col px-4 py-4 rounded-4" style={{minWidth:"250px", maxWidth:"400px"}}>
                <div className="d-flex flex-row justify-content-center mb-4">
                    <h1 style={{fontSize:"xxx-large"}}>🍚</h1>
                </div>
                

                <BadgeGreen message="MAKANAN SIAP SAJI"/>
                <h6 className="syne-h1 text-green1 mb-2 mt-3">{this.props.foodname}</h6>

                <p className="d-flex flex-row gap-1 text-green4">
                    <i className="bi bi-geo-alt-fill"></i>
                    Medan, Sumatera Utara
                </p>

                <hr className="my-2" style={{border: "1px solid var(--g3)"}}/>

                <div className="d-flex flex-row justify-content-between mb-3">
                    <p className="d-flex flex-row gap-1 text-green4">
                        <i className="bi bi-box-seam"></i>
                        40 porsi
                    </p>
                </div>

                <button className="w-100 btn-outline-green px-4 py-2 rounded-3 fw-bold">
                    Klaim Donasi
                </button>
            </div>
           
        );
    }
}

export default ExampleFoodCard;