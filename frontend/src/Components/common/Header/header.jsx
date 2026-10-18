import { useRef, useState } from "react";
import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { FaBars, FaTimes } from "react-icons/fa";

import { logout } from "../../../store/slices/authSlice";
import { setSearchTerm, clearSearch } from "../../../store/slices/searchSlice";
import { notify } from "../../../utils/notify";
import AdminNavbar from "../../admin/AdminNavbar.jsx";
import SellerNavbar from "../../seller/SellerNavbar.jsx";

import "./header.css";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRef = useRef(null);

  const { isLoggedIn, user: authUser } = useSelector((state) => state.auth || {});
  const profileUser = useSelector((state) => state.profile?.data);
  const rawRole = profileUser?.accountType || authUser?.accountType || authUser?.role || "user";
  const normalizedRole = typeof rawRole === "string" ? (rawRole === "regular" ? "user" : rawRole.toLowerCase()) : "user";

  const searchTerm = useSelector((state) => state.search?.searchTerm || "");
  const rawCart = useSelector((state) => state.cart?.items);
  const cartItems = Array.isArray(rawCart) ? rawCart : [];
  const cartCount = cartItems.reduce((sum, item) => sum + (item?.quantity || 1), 0);

  const [menuOpen, setMenuOpen] = useState(false);

  // If on dedicated login page or welcome page, don't show navigation header
  if (
    location.pathname === "/admin/login" ||
    location.pathname === "/seller/login" ||
    location.pathname === "/welcome"
  ) {
    return null;
  }

  // If on Admin portal, render dedicated Administrator Navbar
  if (location.pathname.startsWith("/admin")) {
    return <AdminNavbar />;
  }

  // If on Seller portal, render dedicated Merchant/Seller Navbar
  if (location.pathname.startsWith("/seller")) {
    return <SellerNavbar />;
  }

  const handleLoginLogoutClick = () => {
    if (isLoggedIn) {
      dispatch(logout());
      notify("Logout successful", "success");
    } else {
      navigate("/login");
    }
    setMenuOpen(false);
  };

  const handleClear = () => {
    dispatch(clearSearch());
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSearchChange = (val) => {
    dispatch(setSearchTerm(val));
    // If user is searching on a different page, bring them to Home to see the results
    if (val.trim() && location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <header className="Header">
      <nav className="components-nav">
        {/* Brand Logo */}
        <Link to={isLoggedIn && normalizedRole === "user" ? "/user" : "/"} className="site-logo">
          <span className="logo-icon">
            <i className="bi bi-bag-heart-fill"></i>
          </span>
          TheStore
        </Link>

        {/* Search visible on desktop & tablet */}
        <div className="search-desktop">
          <i className="bi bi-search search-icon"></i>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Search products, categories, specs..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear-btn" onClick={handleClear} aria-label="Clear search">
              <i className="bi bi-x-circle-fill"></i>
            </button>
          )}
        </div>

        {/* Right Nav Action Controls */}
        <div className="nav-right-actions">
          {/* Quick Cart button for mobile header (customers and guests only) */}
          {(!isLoggedIn || normalizedRole === "user") && (
            <Link
              to={isLoggedIn && normalizedRole === "user" ? "/user/cart" : "/cart"}
              className="mobile-cart-action"
              aria-label="View shopping cart"
            >
              <i className="bi bi-cart3"></i>
              {cartCount > 0 && <span className="mobile-cart-badge">{cartCount}</span>}
            </Link>
          )}

          {/* Mobile Hamburger Button */}
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label="Toggle navigation menu"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Backdrop Overlay */}
        {menuOpen && (
          <div
            className="mobile-nav-backdrop"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Navigation Links Menu */}
        <div className={`nav-menu ${menuOpen ? "open" : ""}`}>
          {/* Search bar inside mobile drawer */}
          <div className="search-mobile">
            <i className="bi bi-search search-icon"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search catalog..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={handleClear} aria-label="Clear search">
                <i className="bi bi-x-circle-fill"></i>
              </button>
            )}
          </div>

          <NavLink
            to={isLoggedIn && normalizedRole === "user" ? "/user" : "/"}
            className={({ isActive }) => `nav-links ${isActive ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            <i className="bi bi-house-door"></i> Store
          </NavLink>

          {/* Role-Specific Navigation */}
          {isLoggedIn && normalizedRole === "seller" ? (
            <>
              <NavLink
                to="/seller"
                end
                className={({ isActive }) => `nav-links seller-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="bi bi-shop"></i>
                <span>Seller Hub</span>
              </NavLink>

              <NavLink
                to="/seller?tab=inventory"
                className={({ isActive }) => `nav-links seller-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="bi bi-box-seam"></i> Products
              </NavLink>

              <NavLink
                to="/seller?tab=orders"
                className={({ isActive }) => `nav-links seller-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="bi bi-receipt"></i> Orders
              </NavLink>
            </>
          ) : isLoggedIn && normalizedRole === "admin" ? (
            <>
              <NavLink
                to="/admin"
                end
                className={({ isActive }) => `nav-links admin-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="bi bi-shield-lock"></i>
                <span>Admin Console</span>
              </NavLink>

              <NavLink
                to="/admin?tab=sellers"
                className={({ isActive }) => `nav-links admin-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="bi bi-patch-check"></i> Sellers
              </NavLink>

              <NavLink
                to="/admin?tab=products"
                className={({ isActive }) => `nav-links admin-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="bi bi-boxes"></i> Catalog
              </NavLink>
            </>
          ) : (
            /* Customer and Guest Navigation */
            <>
              {isLoggedIn && (
                <NavLink
                  to="/user/profile"
                  className={({ isActive }) => `nav-links profile-nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="bi bi-person"></i>
                  <span>Profile</span>
                </NavLink>
              )}

              <NavLink
                to={isLoggedIn && normalizedRole === "user" ? "/user/cart" : "/cart"}
                className={({ isActive }) => `nav-links cart-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon-wrap">
                  <i className="bi bi-cart3"></i>
                  {cartCount > 0 && <span className="nav-badge">{cartCount}</span>}
                </span>
                Cart
              </NavLink>

              {isLoggedIn && (
                <NavLink
                  to="/user/orders"
                  className={({ isActive }) => `nav-links ${isActive ? "active" : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <i className="bi bi-receipt"></i> Orders
                </NavLink>
              )}
            </>
          )}

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
