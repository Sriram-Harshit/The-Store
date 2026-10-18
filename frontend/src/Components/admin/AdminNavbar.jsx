import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import config from "../../config/config";
import { logout } from "../../store/slices/authSlice";
import { notify } from "../../utils/notify";
import "./AdminNavbar.css";

const AdminNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "sellers";
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token) || localStorage.getItem("token");

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const [adminStats, setAdminStats] = useState({
    pendingSellers: 0,
    pendingProducts: 0,
    totalProducts: 0,
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/admin/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted && res.data) {
          setAdminStats({
            pendingSellers: res.data.pendingSellers || 0,
            pendingProducts: res.data.pendingProducts || 0,
            totalProducts: res.data.totalProducts || 0,
          });
        }
      } catch (err) {
        // silently fallback
      }
    };

    if (token) fetchStats();

    const handleRefresh = () => {
      if (token) fetchStats();
    };
    window.addEventListener("refresh-admin-nav-stats", handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("refresh-admin-nav-stats", handleRefresh);
    };
  }, [token]);

  if (windowWidth < 1024) {
    return null;
  }

  const handleAdminLogout = () => {
    dispatch(logout());
    notify("Administrator session ended", "info");
    navigate("/admin/login");
  };

  return (
    <header className="admin-header-nav">
      <div className="admin-nav-container">
        {/* Brand */}
        <div className="admin-nav-brand">
          <Link to="/admin" className="admin-logo-link">
            <span className="admin-nav-shield">
              <i className="bi bi-shield-lock-fill"></i>
            </span>
            <div className="admin-nav-title-group">
              <span className="admin-nav-name">TheStore</span>
              <span className="admin-nav-badge">ADMIN CONSOLE</span>
            </div>
          </Link>
        </div>

        {/* Console Navigation Links */}
        <nav className="admin-nav-links">
          <Link
            to="/admin?tab=overview"
            className={`admin-nav-item ${currentTab === "overview" ? "active" : ""}`}
          >
            <i className="bi bi-graph-up-arrow"></i>
            <span>Analytics</span>
          </Link>

          <Link
            to="/admin?tab=sellers"
            className={`admin-nav-item ${currentTab === "sellers" ? "active" : ""}`}
          >
            <i className="bi bi-shop"></i>
            <span>Sellers</span>
            {adminStats.pendingSellers > 0 && (
              <span className="admin-nav-pill-alert" title={`${adminStats.pendingSellers} pending approvals`}>
                {adminStats.pendingSellers}
              </span>
            )}
          </Link>

          <Link
            to="/admin?tab=users"
            className={`admin-nav-item ${currentTab === "users" ? "active" : ""}`}
          >
            <i className="bi bi-people-fill"></i>
            <span>Users</span>
          </Link>

          <Link
            to="/admin?tab=products"
            className={`admin-nav-item ${currentTab === "products" ? "active" : ""}`}
          >
            <i className="bi bi-box-seam-fill"></i>
            <span>Products</span>
            {adminStats.pendingProducts > 0 ? (
              <span
                className="admin-nav-pill-alert"
                title={`${adminStats.pendingProducts} products pending approval`}
              >
                {adminStats.pendingProducts}
              </span>
            ) : adminStats.totalProducts > 0 ? (
              <span className="admin-nav-pill-count">{adminStats.totalProducts}</span>
            ) : null}
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="admin-nav-actions">
          <div className="admin-user-pill">
            <i className="bi bi-person-fill-gear"></i>
            <span>{user?.firstName || "Admin"}</span>
          </div>

          <button
            type="button"
            className="admin-nav-logout-btn"
            onClick={handleAdminLogout}
            title="Sign out of Admin Console"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
