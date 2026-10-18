import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import { registerUser } from "../../../store/slices/authSlice";
import { notify } from "../../../utils/notify";
import Button from "../../common/ui/buttons/button.jsx";

import "./register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    accountType: "user", // "user" | "seller" | "admin"
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoggedIn, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ["firstName", "lastName", "username", "email", "phone", "password"];
    if (requiredFields.some((key) => !formData[key]?.trim())) {
      notify("Please fill in all required fields", "warning");
      return;
    }

    dispatch(registerUser(formData))
      .unwrap()
      .then(() => {
        notify("Account created successfully! Please login.", "success");
        navigate("/login");
      })
      .catch((err) => {
        notify(err || "Registration failed", "error");
      });
  };

  return (
    <div className="BgContainer">
      <div className="register-container">
        <div className="auth-brand">
          <span className="auth-logo-badge">
            <i className="bi bi-person-plus-fill"></i>
          </span>
          <h1 className="conatinername">Create Account</h1>
          <p className="auth-subtitle">
            Join TheStore as a Customer to browse catalog, track orders & save wishlists
          </p>
        </div>

        <form className="form" onSubmit={handleSubmit}>

          <div className="rowAlign">
            <div className="FieldContainer">
              <label className="form-label" htmlFor="reg-firstName">FIRST NAME</label>
              <input
                id="reg-firstName"
                className="InputField"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                required
              />
            </div>

            <div className="FieldContainer">
              <label className="form-label" htmlFor="reg-lastName">LAST NAME</label>
              <input
                id="reg-lastName"
                className="InputField"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="rowAlign">
            <div className="FieldContainer">
              <label className="form-label" htmlFor="reg-username">USERNAME</label>
              <input
                id="reg-username"
                className="InputField"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe"
                required
              />
            </div>

            <div className="FieldContainer">
              <label className="form-label" htmlFor="reg-email">EMAIL</label>
              <input
                id="reg-email"
                className="InputField"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="rowAlign">
            <div className="FieldContainer">
              <label className="form-label" htmlFor="reg-phone">PHONE</label>
              <input
                id="reg-phone"
                className="InputField"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>

            <div className="FieldContainer">
              <label className="form-label" htmlFor="reg-password">PASSWORD</label>
              <input
                id="reg-password"
                className="InputField"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading}>
            <i className="bi bi-check-circle-fill"></i> Complete Registration
          </Button>
        </form>

        <div className="auth-footer-prompt">
          <span>Already have an account?</span>
          <Link to="/login" className="reg-link">
            Sign In Instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
