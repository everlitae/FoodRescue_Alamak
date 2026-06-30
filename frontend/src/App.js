import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./Context/AuthContext";

import "./index.css";
import "leaflet/dist/leaflet.css";

import SignInPage from "./Page/SignInPage";
import RegisterPage from "./Page/RegisterPage";
import CompleteProfile from "./Page/CompleteProfile";
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
import FAQ from "./Page/FAQ";
import ForgotPassword from "./Page/ForgotPassword";
import Contact from "./Page/Contact";
import PrivacyPolicy from "./Page/PrivacyPolicy";
import TermsAndCondition from "./Page/TermsAndCondition";
import OAuthCallback from "./Page/OAuthCallback";

import MainLayout from "./Layout/MainLayout";
import LandingPage from "./Page/LandingPage";

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

// Guard: kalau sudah login tapi belum complete profile → redirect ke complete-profile
function ProfileCompleteRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (!user.is_profile_complete) return <Navigate to="/complete-profile" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route
            path="home"
            element={
              <ProfileCompleteRoute>
                <Home />
              </ProfileCompleteRoute>
            }
          />
          <Route path="donations" element={<Donations />} />

          <Route
            path="donations/create"
            element={
              <ProfileCompleteRoute>
                <ProviderRoute>
                  <CreateDonation />
                </ProviderRoute>
              </ProfileCompleteRoute>
            }
          />

          <Route path="donations/:id" element={<DonationDetail />} />

          <Route
            path="profile"
            element={
              <ProfileCompleteRoute>
                <Profile />
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="history"
            element={
              <ProfileCompleteRoute>
                <History />
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="messages"
            element={
              <ProfileCompleteRoute>
                <Messages />
              </ProfileCompleteRoute>
            }
          />
          <Route
            path="community"
            element={
              <ProfileCompleteRoute>
                <Community />
              </ProfileCompleteRoute>
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
          <Route path="faq" element={<FAQ />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-and-condition" element={<TermsAndCondition />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Route>

        <Route path="/login" element={<SignInPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/oauth-callback" element={<OAuthCallback />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />

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
