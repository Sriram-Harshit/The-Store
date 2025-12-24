import React, { useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaBars, FaTimes } from "react-icons/fa";

import { logout } from "../../store/slices/authSlice";
import { setSearchTerm } from "../../store/slices/searchSlice";
import { notify } from "../../utils/notify";

import "./header.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const { isLoggedIn } = useSelector((state) => state.auth);
  const searchTerm = useSelector((state) => state.search.searchTerm);

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLoginLogoutClick = () => {
    if (isLoggedIn) {
      dispatch(logout());
      notify("Logout successful", "success");
    } else {
      navigate("/login");
    }
    setMenuOpen(false);
  };

  return (
    <header className="Header">
      <nav className="components-nav">
        <Link to="/" className="site-logo">
          TheStore
        </Link>
        {/* Search visible on tablet & desktop */}
        <div className="search-desktop">
          <i className="bi bi-search"></i>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          />
        </div>

        {/* Hamburger */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Menu */}
        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          {/* Search ONLY for mobile */}
          <div className="search-mobile">
            <i className="bi bi-search"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
          </div>

          <NavLink
            to="/"
            className="nav-links"
            onClick={() => setMenuOpen(false)}
          >
            <i className="bi bi-house"></i> Home
          </NavLink>

          <NavLink
            to="/profile"
            className="nav-links"
            onClick={() => setMenuOpen(false)}
          >
            <i className="bi bi-person"></i> Profile
          </NavLink>

          <NavLink
            to="/cart"
            className="nav-links"
            onClick={() => setMenuOpen(false)}
          >
            <i className="bi bi-cart"></i> Cart
          </NavLink>

          <NavLink
            to="/orders"
            className="nav-links"
            onClick={() => setMenuOpen(false)}
          >
            <i className="bi bi-card-list"></i> Orders
          </NavLink>

          <button
            className="nav-links logoutbutton"
            onClick={handleLoginLogoutClick}
          >
            <i
              className={`bi ${
                isLoggedIn ? "bi-box-arrow-right" : "bi-box-arrow-in-left"
              }`}
            ></i>
            {isLoggedIn ? "Logout" : "Login"}
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;
