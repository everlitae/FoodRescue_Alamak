import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./Context/AuthContext";

import "./index.css";
import "leaflet/dist/leaflet.css";

// FIXED IMPORT
import SignInPage from "./Page/SignInPage";
import RegisterPage from "./Page/RegisterPage";
import Donations from "./Page/Donations";
import DonationDetail from "./Page/DonationDetail";
import CreateDonation from "./Page/CreateDonation";
import Admin from "./Page/Admin";
import Profile from "./Page/Profile";
import History from "./Page/History";
import Messages from "./Page/Messages";
import Community from "./Page/Community";
import Home from "./Page/Home";
import AboutUs from "./Page/AboutUs";

import MainLayout from "./Layout/MainLayout";
import LandingPage from "./Page/LandingPage";

// Route yang butuh login
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return user ? children : <Navigate to="/login" />;
}

// Route khusus admin
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return user?.role === "admin" ? children : <Navigate to="/" />;
}

// Route khusus food_provider
function ProviderRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  return user?.role === "food_provider" ? (
    children
  ) : (
    <Navigate to="/donations" />
  );
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />

          <Route path="donations" element={<Donations />} />
          <Route path="donations/:id" element={<DonationDetail />} />

          <Route
            path="donations/create"
            element={
              <PrivateRoute>
                <ProviderRoute>
                  <CreateDonation />
                </ProviderRoute>
              </PrivateRoute>
            }
          />
          <Route
            path="profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="messages"
            element={
              <PrivateRoute>
                <Messages />
              </PrivateRoute>
            }
          />
          <Route
            path="community"
            element={
              <PrivateRoute>
                <Community />
              </PrivateRoute>
            }
          />
          <Route
            path="admin"
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
          <Route path="about" element={<AboutUs />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Route>

        <Route path="/login" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
