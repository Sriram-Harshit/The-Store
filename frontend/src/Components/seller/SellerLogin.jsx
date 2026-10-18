import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, logout } from "../../store/slices/authSlice";
import { notify } from "../../utils/notify";
import "./SellerLogin.css";

const SellerLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user, loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "apextech@thestore.com",
    password: "seller123",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  const role = (user?.accountType || user?.role || "").toLowerCase();

  useEffect(() => {
    if (isLoggedIn && role === "seller") {
      navigate("/seller");
    }
  }, [isLoggedIn, role, navigate]);

  const handleFillDemo = (type) => {
    if (type === "verified") {
      setFormData({
        username: "apextech@thestore.com",
        password: "seller123",
      });
    } else {
      setFormData({
        username: "eco@thestore.com",
        password: "seller123",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");

    if (!formData.username.trim() || !formData.password) {
      setAuthError("Please enter your merchant email and password");
      return;
    }

    try {
      const res = await dispatch(loginUser(formData)).unwrap();
      const userRole = (res?.accountType || res?.user?.accountType || "").toLowerCase();
      if (userRole !== "seller" && userRole !== "admin") {
        dispatch(logout());
        setAuthError(
          `Access restricted: Account "${formData.username}" (${userRole}) is not authorized as a seller. Customer accounts must sign in at /login.`
        );
        return;
      }
      notify("Welcome to TheStore Merchant Studio", "success");
      navigate("/seller");
    } catch (err) {
      setAuthError(typeof err === "string" ? err : "Seller login verification failed");
    }
  };

  return (
    <div className="seller-login-fullscreen">
      <div className="seller-login-box">
        {/* Header */}
        <div className="seller-login-header">
          <div className="seller-store-emblem">
            <i className="bi bi-shop"></i>
          </div>
          <span className="seller-zone-tag">MERCHANT NETWORK</span>
          <h1>Merchant & Seller Sign-In</h1>
          <p>
            Access your inventory controls, list new products with deep specifications, and monitor your orders.
          </p>
        </div>

        {/* Demo 1-Click Credentials Banner */}
        <div className="seller-demo-credentials-callout">
          <div className="demo-callout-text">
            <span className="seller-demo-pill">TEST SELLER ACCOUNT</span>
            <code>apextech@thestore.com</code> / <code>seller123</code>
          </div>
          <div className="seller-demo-actions">
            <button
              type="button"
              className="fill-seller-creds-btn"
              onClick={() => handleFillDemo("verified")}
            >
              <i className="bi bi-check-circle-fill"></i> Fill Verified Merchant
            </button>
            <button
              type="button"
              className="fill-seller-creds-btn secondary"
              onClick={() => handleFillDemo("pending")}
              title="Test onboarding approval in Admin Portal"
            >
              <i className="bi bi-clock-history"></i> Fill Pending Merchant
            </button>
          </div>
        </div>

        {isLoggedIn && role !== "seller" && (
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1e40af",
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
              Signed in as <strong>{user?.email || user?.username}</strong> ({role.toUpperCase()}). Sign in below to switch to a Seller account.
            </div>
            <button
              type="button"
              onClick={() => dispatch(logout())}
              style={{
                background: "#dbeafe",
                border: "1px solid #2563eb",
                color: "#1e40af",
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
          <div className="seller-login-error">
            <i className="bi bi-exclamation-triangle-fill"></i>
            <span>{authError}</span>
          </div>
        )}

        {/* Form */}
        <form className="seller-form" onSubmit={handleSubmit}>
          <div className="seller-input-group">
            <label htmlFor="seller-email">MERCHANT USERNAME OR EMAIL</label>
            <div className="seller-field-wrap">
              <i className="bi bi-envelope-at-fill"></i>
              <input
                id="seller-email"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="seller@thestore.com"
                required
              />
            </div>
          </div>

          <div className="seller-input-group">
            <label htmlFor="seller-password">MERCHANT PASSWORD</label>
            <div className="seller-field-wrap">
              <i className="bi bi-key-fill"></i>
              <input
                id="seller-password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="seller-pw-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                <i className={`bi bi-${showPassword ? "eye-slash" : "eye"}`}></i>
              </button>
            </div>
          </div>

          <button type="submit" className="seller-auth-submit-btn" disabled={loading}>
            {loading ? (
              <span>Authenticating Merchant...</span>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right"></i>
                <span>Open Seller Hub</span>
              </>
            )}
          </button>
        </form>

        <div className="seller-login-footer">
          <Link to="/" className="back-store-link">
            <i className="bi bi-arrow-left"></i> Return to TheStore Marketplace
          </Link>
          <span className="dot">•</span>
          <Link to="/admin/login" className="switch-portal-link">
            Administrator Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SellerLogin;
