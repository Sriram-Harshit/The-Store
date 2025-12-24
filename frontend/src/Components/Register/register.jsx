import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

import { registerUser } from "../../store/slices/authSlice";
import { notify } from "../../utils/notify";
import Button from "../ui/buttons/button.jsx";

import "./register.css";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    password: "",
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

    if (Object.values(formData).some((v) => !v)) {
      notify("Please fill in all fields", "warning");
      return;
    }

    dispatch(registerUser(formData))
      .unwrap()
      .then(() => {
        notify("Registration successful. Please login.", "success");
        navigate("/login");
      })
      .catch((err) => {
        notify(err, "error");
      });
  };

  return (
    <div className="BgContainer">
      <div className="register-container">
        <form className="form" onSubmit={handleSubmit}>
          <h1 className="conatinername">Register</h1>

          <div className="rowAlign">
            <div className="FieldContainer">
              <label className="form-label">FIRST NAME</label>
              <input
                className="InputField"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="FieldContainer">
              <label className="form-label">LAST NAME</label>
              <input
                className="InputField"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="rowAlign">
            <div className="FieldContainer">
              <label className="form-label">USERNAME</label>
              <input
                className="InputField"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div className="FieldContainer">
              <label className="form-label">EMAIL</label>
              <input
                className="InputField"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="rowAlign">
            <div className="FieldContainer">
              <label className="form-label">PHONE</label>
              <input
                className="InputField"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="FieldContainer">
              <label className="form-label">PASSWORD</label>
              <input
                className="InputField"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <Button type="submit" loading={loading}>
            Register
          </Button>

          <Link to="/login" className="reg-link">
            Have an account? Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Register;
