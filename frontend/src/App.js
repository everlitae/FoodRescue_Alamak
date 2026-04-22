import React from 'react';
import { Route, Routes } from 'react-router';

import MainLayout from './Layout/MainLayout.jsx';

import SignInPage from './Page/SignInPage.jsx';
import RegisterPage from './Page/RegisterPage.jsx';

function App() {
    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route path="about" element={<div>About</div>} />       
            </Route> 

            <Route path="signin" element={<SignInPage />} />
            <Route path="register" element= {<RegisterPage />} />

            <Route path="*" element={<div>404 Not Found</div>} />

            
        </Routes>
    );
}

export default App;
