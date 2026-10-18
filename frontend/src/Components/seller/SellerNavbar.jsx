import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import config from "../../config/config";
import { logout } from "../../store/slices/authSlice";
import { notify } from "../../utils/notify";
import "./SellerNavbar.css";

const SellerNavbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "dashboard";
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const [navStats, setNavStats] = useState({
    productsCount: 0,
    pendingOrdersCount: 0,
    totalOrdersCount: 0,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchNavStats = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/seller/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted && res.data) {
          setNavStats({
            productsCount: res.data.productsListed || 0,
            pendingOrdersCount: res.data.pendingOrders || 0,
            totalOrdersCount: res.data.totalOrders || 0,
          });
        }
      } catch (err) {
        // silently fallback
      }
    };

    if (token) {
      fetchNavStats();
    }

    const handleRefresh = () => {
      if (token) fetchNavStats();
    };
    window.addEventListener("refresh-seller-nav-stats", handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("refresh-seller-nav-stats", handleRefresh);
    };
  }, [token]);

  const handleSellerLogout = () => {
    dispatch(logout());
    notify("Seller session closed", "info");
    navigate("/seller/login");
  };

  return (
    <header className="seller-header-nav">
      <div className="seller-nav-container">
        {/* Brand */}
        <div className="seller-nav-brand">
          <Link to="/seller?tab=dashboard" className="seller-logo-link">
            <span className="seller-nav-icon">
              <i className="bi bi-shop"></i>
            </span>
            <div className="seller-nav-title-group">
              <span className="seller-nav-name">TheStore</span>
              <span className="seller-nav-badge">SELLER HUB</span>
            </div>
          </Link>
        </div>

        {/* Console Navigation Links */}
        <nav className="seller-nav-links">
          <Link
            to="/seller?tab=dashboard"
            className={`seller-nav-item ${currentTab === "dashboard" ? "active" : ""}`}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/seller?tab=inventory"
            className={`seller-nav-item ${currentTab === "inventory" ? "active" : ""}`}
          >
            <i className="bi bi-grid-1x2-fill"></i>
            <span>Inventory</span>
            {navStats.productsCount > 0 && (
              <span className="seller-nav-pill-count">{navStats.productsCount}</span>
            )}
          </Link>

          <Link
            to="/seller?tab=orders"
            className={`seller-nav-item ${currentTab === "orders" ? "active" : ""}`}
          >
            <i className="bi bi-receipt"></i>
            <span>Orders</span>
            {navStats.pendingOrdersCount > 0 ? (
              <span className="seller-nav-pill-alert" title={`${navStats.pendingOrdersCount} pending orders`}>
                {navStats.pendingOrdersCount}
              </span>
            ) : navStats.totalOrdersCount > 0 ? (
              <span className="seller-nav-pill-count">{navStats.totalOrdersCount}</span>
            ) : null}
          </Link>

          <Link
            to="/seller?tab=settings"
            className={`seller-nav-item ${currentTab === "settings" ? "active" : ""}`}
          >
            <i className="bi bi-sliders"></i>
            <span>Profile</span>
          </Link>

          <button
            type="button"
            className="seller-nav-add-btn"
            onClick={() => window.dispatchEvent(new CustomEvent("open-seller-add-product"))}
            title="Add a new product"
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Add Product</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="seller-nav-actions">
          <div className="seller-user-pill">
            <i className="bi bi-person-check-fill"></i>
            <span>{user?.firstName || user?.storeName || "Merchant"}</span>
          </div>

          <button
            type="button"
            className="seller-nav-logout-btn"
            onClick={handleSellerLogout}
            title="Sign out of Seller Hub"
          >
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default SellerNavbar;

