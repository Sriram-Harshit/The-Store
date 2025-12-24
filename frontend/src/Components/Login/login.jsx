import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import { loginUser } from "../../store/slices/authSlice";
import Button from "../ui/buttons/button.jsx";
import { notify } from "../../utils/notify.jsx";

import "./login.css";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      notify("Please fill in all fields", "warning");
      return;
    }

    dispatch(loginUser(formData))
      .unwrap()
      .then(() => {
        notify("Login successful", "success");
      })
      .catch((err) => {
        notify(err, "error");
      });
  };

  return (
    <div className="BgContainer">
      <div className="login-container">
        <form className="form" onSubmit={handleSubmit}>
          <h1 className="conatinername">Login</h1>

          <div className="FieldContainer">
            <label className="form-label">USERNAME</label>
            <input
              className="InputField"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="user"
            />
          </div>

          <div className="FieldContainer password-field">
            <label className="form-label">PASSWORD</label>

            <input
              className="InputField"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Theuser@1"
            />

            <span
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <Button type="submit" variant="primary" size="md" loading={loading}>
            Login
          </Button>
        </form>

        <Link to="/register" className="reg-link">
          Don&apos;t have an account? Register
        </Link>
      </div>
    </div>
  );
};

export default Login;
