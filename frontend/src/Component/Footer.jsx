import React from 'react';

class Footer extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className='p-5'>
                <div className="d-flex flex-row align-items-start justify-content-between gap-5" style={{backgroundColor:"transparent"}}>
                    <div className='col d-flex flex-column gap-2 justify-content-start align-items-start'>
                        <div className="d-flex flex-wrap align-items-center gap-3">
                            <img src="/assets/logo/foodrescue_logo_only.png" width={"45px"} height={"40px"} />
                            <div>
                                <h6 className="syne-h1 text-green3">
                                    FoodRescue
                                </h6>
                                <p className="outfit text-green3">WEB PLATFORM</p>
                            </div>
                        </div>
                        <p className="text-green3" style={{fontSize:"small"}}>
                            Platform digital yang mengurangi food waste dan menghubungi semua pihak yang peduli.
                        </p>
                    </div>
                    <div className='col d-flex flex-column align-items-end gap-3'>
                        <p className='text-green3 fw-bold'>Informasi</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Tentang Kami</p>
                        <p className='text-green2' style={{fontSize:"small"}}>FAQ</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Kebijakan Privasi</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Kontak</p>
                    </div>
                    <div className='col d-flex flex-column align-items-end gap-3'>
                        <p className='text-green3 fw-bold'>Informasi</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Tentang Kami</p>
                        <p className='text-green2' style={{fontSize:"small"}}>FAQ</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Kebijakan Privasi</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Kontak</p>
                    </div>
                    <div className='col d-flex flex-column align-items-end gap-3'>
                        <p className='text-green3 fw-bold'>Informasi</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Tentang Kami</p>
                        <p className='text-green2' style={{fontSize:"small"}}>FAQ</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Kebijakan Privasi</p>
                        <p className='text-green2' style={{fontSize:"small"}}>Kontak</p>
                    </div>
                    
                </div>
                <p className='mt-5 text-green4 fw-semibold' style={{fontSize:"small"}}>&copy; 2026 FoodRescue Web - Alamak IF-A Sore. All Rights Reserved.</p>
            </div>
        );
    }
}

export default Footer;