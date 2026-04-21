import React from 'react';
import { Route, Routes } from 'react-router';
import MainLayout from './Layout/MainLayout.jsx';
import SignInRegisterLayout from './Layout/SignInRegisterLayout.jsx';

import SignInCard from './Component/SignInCard.jsx';
import RegisterCard from './Component/RegisterCard.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route path="about" element={<div>About</div>} />       
            </Route> 

            <Route path="user" element={<SignInRegisterLayout />}>
                <Route path="signin" element={<SignInCard />} />
                <Route path="register" element= {<RegisterCard />} />
            </Route>

            <Route path="*" element={<div>404 Not Found</div>} />

            
        </Routes>
    );
}

export default App;
