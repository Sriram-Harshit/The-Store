import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, logout } from "../../store/slices/authSlice";
import { notify } from "../../utils/notify";
import Button from "../common/ui/buttons/button";
import "./AdminLogin.css";

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "admin@thestore.com",
    password: "admin123",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const role = (user?.accountType || user?.role || "").toLowerCase();

  useEffect(() => {
    if (isLoggedIn && role === "admin") {
      navigate("/admin");
    }
  }, [isLoggedIn, role, navigate]);

  const handleFillDemo = () => {
    setFormData({
      username: "admin@thestore.com",
      password: "admin123",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!formData.username.trim() || !formData.password) {
      setAuthError("Please provide both Administrator ID and Password");
      return;
    }

    try {
      const res = await dispatch(loginUser(formData)).unwrap();
      const userRole = (res?.accountType || res?.user?.accountType || "").toLowerCase();
      if (userRole !== "admin") {
        dispatch(logout());
        setAuthError(`This account (${userRole}) does not have administrative privileges.`);
        return;
      }
      notify("Welcome to TheStore Admin Console", "success");
      navigate("/admin");
    } catch (err) {
      setAuthError(typeof err === "string" ? err : "Admin credentials verification failed");
    }
  };

  return (
    <div className="admin-login-fullscreen">
      <div className="admin-login-box">
        {/* Header */}
        <div className="admin-login-header">
          <div className="admin-shield-emblem">
            <i className="bi bi-shield-lock-fill"></i>
          </div>
          <span className="admin-zone-tag">RESTRICTED ACCESS ZONE</span>
          <h1>System Administrator Login</h1>
          <p>
            Authorized access point for platform oversight, seller onboarding approvals, user governance, and infrastructure health.
          </p>
        </div>

        {/* Demo 1-Click Credentials Banner */}
        <div className="admin-demo-credentials-callout">
          <div className="demo-callout-text">
            <span className="demo-pill">TEST ADMIN CREDENTIALS</span>
            <code>admin@thestore.com</code> / <code>admin123</code>
          </div>
          <button
            type="button"
            className="fill-admin-creds-btn"
            onClick={handleFillDemo}
          >
            <i className="bi bi-lightning-charge-fill"></i> Auto-Fill Credentials
          </button>
        </div>

        {isLoggedIn && role !== "admin" && (
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            color: "#92400e",
            borderRadius: "10px",
            padding: "0.85rem 1rem",
            fontSize: "0.88rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem"
          }}>
            <div>
              <i className="bi bi-info-circle-fill" style={{ marginRight: "0.5rem" }}></i>
              Signed in as <strong>{user?.email || user?.username}</strong> ({role.toUpperCase()}). Sign in below to switch to an Admin account.
            </div>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              style={{
                background: "#fef3c7",
                border: "1px solid #d97706",
                color: "#92400e",
                borderRadius: "6px",
                padding: "0.25rem 0.6rem",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.78rem"
              }}
            >
              Sign Out
            </button>
          </div>
        )}

        {authError && (
          <div className="admin-login-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-input-group">
            <label htmlFor="admin-user-id">ADMINISTRATOR EMAIL OR ID</label>
            <div className="admin-field-wrap">
              <i className="bi bi-person-badge"></i>
              <input
                id="admin-user-id"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="admin@thestore.com"
                required
              />
            </div>
          </div>

          <div className="admin-input-group">
            <label htmlFor="admin-password">SECURITY PASSCODE</label>
            <div className="admin-field-wrap">
              <i className="bi bi-key-fill"></i>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="admin-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <i className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="admin-auth-submit-btn" disabled={loading}>
            {loading ? (
              <span>Authenticating Credentials...</span>
            ) : (
              <>
                <i className="bi bi-shield-check"></i>
                <span>Authorize & Open Admin Console</span>
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="back-store-link">
            <i className="bi bi-arrow-left"></i> Return to TheStore Customer Marketplace
          </Link>
          <span className="dot">•</span>
          <Link to="/seller/login" className="switch-portal-link">
            Merchant / Seller Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
