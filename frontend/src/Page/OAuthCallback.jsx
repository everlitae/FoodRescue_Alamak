import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import axios from "axios";

export default function OAuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (error === "account_not_found") {
      navigate("/login?error=account_not_found");
      return;
    }

    if (!token) {
      navigate("/login?error=no_token");
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        login(token, res.data, true);
        if (!res.data.is_profile_complete) {
          navigate("/complete-profile");
        } else {
          navigate("/home");
        }
      })
      .catch(() => navigate("/login?error=oauth_failed"));
  }, [login, navigate]);

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center main-bg-color">
      <div className="text-center">
        <div className="spinner-border mb-3" style={{ color: "var(--g2)" }} />
        <p className="outfit text-green3">Menghubungkan akun...</p>
      </div>
    </div>
  );
}
