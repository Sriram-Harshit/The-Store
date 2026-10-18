import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { loginUser, logout } from "../../../store/slices/authSlice";
import Button from "../../common/ui/buttons/button.jsx";
import { notify } from "../../../utils/notify.jsx";

import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "customer@thestore.com",
    password: "user123",
  });
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn && user) {
      const role = (user.accountType || user.role || "user").toLowerCase();
      if (role === "admin") {
        navigate("/admin");
      } else if (role === "seller") {
        navigate("/seller");
      } else {
        navigate("/user");
      }
    }
  }, [isLoggedIn, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.username.trim() || !formData.password) {
      notify("Please enter both username/email and password", "warning");
      return;
    }

    dispatch(loginUser(formData))
      .unwrap()
      .then((res) => {
        const actualRole = (res?.accountType || res?.user?.accountType || "user").toLowerCase();
        const firstName = res?.user?.firstName || "Customer";

        // Strict role isolation: Every user type has their own login page
        if (actualRole === "seller") {
          dispatch(logout());
          notify(
            "Access restricted: This portal is exclusively for Customers. Store Sellers must log in through the Seller Hub (/seller/login).",
            "error"
          );
          return;
        }

        if (actualRole === "admin") {
          dispatch(logout());
          notify(
            "Access restricted: This portal is exclusively for Customers. Administrators must log in through the Admin Console (/admin/login).",
            "error"
          );
          return;
        }

        // Permitted Customer
        notify(`Welcome back, ${firstName}!`, "success");
        navigate("/user");
      })
      .catch((err) => {
        notify(err || "Invalid credentials", "error");
      });
  };

  return (
    <div className="BgContainer">
      <div className="login-container">
        <div className="auth-brand">
          <span className="auth-logo-badge">
            <i className="bi bi-person-fill"></i>
          </span>
          <h1 className="conatinername">Customer Sign-In</h1>
          <p className="auth-subtitle">
            Access your shopping bag, order tracking, and wishlists
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="FieldContainer">
            <label className="form-label" htmlFor="login-username">
              USERNAME OR EMAIL
            </label>
            <div className="input-with-icon">
              <i className="bi bi-person input-icon"></i>
              <input
                id="login-username"
                className="InputField"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="customer@thestore.com or username"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="FieldContainer password-field">
            <label className="form-label" htmlFor="login-password">
              PASSWORD
            </label>
            <div className="input-with-icon">
              <i className="bi bi-lock input-icon"></i>
              <input
                id="login-password"
                className="InputField"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading}>
            <i className="bi bi-box-arrow-in-right"></i> Sign in to Customer Account
          </Button>
        </form>

        <div className="auth-footer-prompt">
          <span>Don&apos;t have an account?</span>
          <Link to="/register" className="reg-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

