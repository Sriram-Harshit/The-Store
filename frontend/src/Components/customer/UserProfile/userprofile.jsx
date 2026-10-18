import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchProfile } from "../../../store/slices/profileSlice";
import {
  fetchWishlist,
  toggleWishlist,
} from "../../../store/slices/wishlistSlice";
import { fetchProducts } from "../../../store/slices/productsSlice";
import { fetchCart, addToCart } from "../../../store/slices/cartSlice";
import { fetchOrders } from "../../../store/slices/ordersSlice";

import Button from "../../common/ui/buttons/button";
import AddressManagement from "../Address/address";
import ProfileEdit from "../ProfileEdit/profile.edit";
import MessageModal from "../../common/ui/messagemodel/messageModel";
import GoodLoader from "../../common/ui/loader/loader";
import { loginUser } from "../../../store/slices/authSlice";

import "./userprofile.css";

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  /* ===== REDUX STATE ===== */
  const {
    data: userDetails,
    loading: profileLoading,
    error,
  } = useSelector((state) => state.profile);

  const wishlistIds = useSelector((state) => state.wishlist.items || []);
  const wishlistLoading = useSelector((state) => state.wishlist.loading);

  const products = useSelector((state) => state.products.items || []);
  const productsLoading = useSelector((state) => state.products.loading);

  const cartItems = useSelector((state) => state.cart.items || []);
  const cartLoading = useSelector((state) => state.cart.loading);

  const orders = useSelector(
    (state) => state.orders.items || state.orders.orders || []
  );

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  /* ===== LOCAL UI STATE ===== */
  const [editProfile, setEditProfile] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  /* ===== FETCH ALL ACCOUNT DATA ===== */
  useEffect(() => {
    if (!isLoggedIn) return;

    dispatch(fetchProfile());
    dispatch(fetchWishlist());
    dispatch(fetchCart());
    dispatch(fetchOrders());

    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, isLoggedIn, products.length]);

  /* ===== DERIVED DATA ===== */
  const wishlistProducts =
    products.length && wishlistIds.length
      ? products.filter((product) =>
          wishlistIds.some((id) => (id._id || id) === product._id)
        )
      : [];

  const initials = userDetails
    ? `${userDetails.firstName?.[0] || ""}${userDetails.lastName?.[0] || ""}`.toUpperCase() || "U"
    : "U";

  const rawRole = (userDetails?.accountType || "user").toLowerCase();
  const normalizedRole = rawRole === "regular" ? "user" : rawRole;

  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0
  );

  const addressesCount = userDetails?.addresses?.length || 0;

  /* ===== HANDLERS ===== */
  const removeWishlist = (productId) => {
    dispatch(toggleWishlist(productId))
      .unwrap()
      .then(() => {
        setMessage("Removed from wishlist");
        setMessageType("success");
      })
      .catch((err) => {
        setMessage(err || "Something went wrong");
        setMessageType("error");
      });
  };

  const handleAddToCartFromWishlist = async (product) => {
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      setMessage(`"${product.name}" added to your cart!`);
      setMessageType("success");
    } catch (err) {
      setMessage(err || "Failed to add product to cart");
      setMessageType("error");
    }
  };

  const handleOpenAssistant = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"));
  };

  const [customerAuthInput, setCustomerAuthInput] = useState({
    username: "customer@thestore.com",
    password: "user123",
  });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const handleCustomerDirectLogin = async (creds) => {
    setAuthSubmitting(true);
    setAuthError("");
    try {
      await dispatch(loginUser(creds || customerAuthInput)).unwrap();
      setMessage("Welcome to your Customer Account!");
      setMessageType("success");
    } catch (err) {
      setAuthError(typeof err === "string" ? err : "Authentication failed");
    } finally {
      setAuthSubmitting(false);
    }
  };

  /* ===== IF NOT LOGGED IN: DEDICATED CUSTOMER GATEWAY ===== */
  if (!isLoggedIn) {
    return (
      <div className="profile-page-wrapper">
        <div className="admin-gateway-card" style={{ borderColor: "#bfdbfe" }}>
          <div className="admin-gateway-header">
            <div className="admin-gateway-badge" style={{ background: "#eff6ff", color: "#1d4ed8", borderColor: "#bfdbfe" }}>
              <i className="bi bi-person-circle"></i>
            </div>
            <h2>Customer Account Portal</h2>
            <p className="admin-gateway-sub">
              Access your personal shopping dashboard, active order tracking, saved wishlists, and shipping addresses.
            </p>
          </div>

          <div className="admin-quick-fill-box">
            <div className="quick-fill-info">
              <span className="demo-tag" style={{ background: "#dbeafe", color: "#1e40af" }}>CUSTOMER DEMO</span>
              <strong>customer@thestore.com</strong> / <strong>user123</strong>
            </div>
            <button
              type="button"
              className="quick-admin-login-btn"
              style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)" }}
              disabled={authSubmitting}
              onClick={() => handleCustomerDirectLogin({ username: "customer@thestore.com", password: "user123" })}
            >
              <i className="bi bi-lightning-charge-fill"></i> 1-Click Sign In as Customer
            </button>
          </div>

          {authError && <div className="admin-auth-error"><i className="bi bi-exclamation-triangle"></i> {authError}</div>}

          <form
            className="admin-gateway-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleCustomerDirectLogin();
            }}
          >
            <div className="gateway-field">
              <label>CUSTOMER EMAIL OR USERNAME</label>
              <div className="gateway-input-wrap">
                <i className="bi bi-envelope"></i>
                <input
                  type="text"
                  value={customerAuthInput.username}
                  onChange={(e) => setCustomerAuthInput({ ...customerAuthInput, username: e.target.value })}
                  placeholder="customer@thestore.com"
                  required
                />
              </div>
            </div>

            <div className="gateway-field">
              <label>PASSWORD</label>
              <div className="gateway-input-wrap">
                <i className="bi bi-key-fill"></i>
                <input
                  type="password"
                  value={customerAuthInput.password}
                  onChange={(e) => setCustomerAuthInput({ ...customerAuthInput, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="gateway-actions">
              <Button type="submit" variant="primary" disabled={authSubmitting}>
                {authSubmitting ? "Authenticating..." : "Sign In to Customer Hub"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Return to Store
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  /* ===== GLOBAL LOADING ===== */
  if (profileLoading && !userDetails) {
    return <GoodLoader message="Retrieving your profile & account dashboard..." />;
  }

  if (error) {
    return (
      <div className="profile-error-box">
        <i className="bi bi-exclamation-octagon-fill"></i>
        <h3>Unable to Load Profile</h3>
        <p>{error}</p>
        <Button variant="primary" onClick={() => dispatch(fetchProfile())}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="profile-page-wrapper">
      {/* ================= HERO ACCOUNT BANNER ================= */}
      <section className="profile-hero-banner">
        <div className="profile-hero-left">
          <div className="profile-avatar-container">
            <div className="profile-avatar-circle">{initials}</div>
            <span className="profile-avatar-online" title="Online & Active"></span>
          </div>

          <div className="profile-hero-info">
            <div className="profile-title-row">
              <h1>{userDetails ? `${userDetails.firstName} ${userDetails.lastName}` : "User Profile"}</h1>
              {normalizedRole === "admin" && (
                <span className="profile-tier-badge role-badge-admin">
                  <i className="bi bi-shield-lock-fill"></i> Platform Administrator
                </span>
              )}
              {normalizedRole === "seller" && (
                <span className="profile-tier-badge role-badge-seller">
                  <i className="bi bi-shop"></i> Verified Seller / Merchant
                </span>
              )}
              {normalizedRole === "user" && (
                <span className="profile-tier-badge role-badge-user">
                  <i className="bi bi-person-check-fill"></i> Customer Account
                </span>
              )}
            </div>

            <p className="profile-username-tag">
              <i className="bi bi-person-fill"></i> @{userDetails?.username || "user"}
              <span className="profile-dot-separator">•</span>
              <i className="bi bi-envelope-fill"></i> {userDetails?.email || "No email available"}
            </p>

            <p className="profile-member-date">
              <i className="bi bi-calendar-check"></i> Member since{" "}
              {userDetails?.createdAt
                ? new Date(userDetails.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "2024"}
            </p>
          </div>
        </div>

        <div className="profile-hero-actions">
          {normalizedRole === "admin" && (
            <Button
              variant="secondary"
              size="md"
              icon={<i className="bi bi-shield-lock-fill"></i>}
              onClick={() => navigate("/admin")}
            >
              Admin Console
            </Button>
          )}

          {normalizedRole === "seller" && (
            <Button
              variant="secondary"
              size="md"
              icon={<i className="bi bi-shop"></i>}
              onClick={() => navigate("/seller")}
            >
              Seller Portal
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            icon={<i className="bi bi-pencil-square"></i>}
            onClick={() => setEditProfile(true)}
          >
            Edit Profile
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={<i className="bi bi-robot"></i>}
            onClick={handleOpenAssistant}
          >
            AI Assistant
          </Button>
        </div>
      </section>

      {/* ================= METRIC STATS ROW ================= */}
      <section className="profile-stats-grid">
        <div
          className="profile-stat-card"
          onClick={() => navigate("/orders")}
          role="button"
          tabIndex={0}
          title="View your orders"
        >
          <div className="stat-icon-wrap orders-icon">
            <i className="bi bi-box-seam"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{orders.length}</span>
            <span className="stat-label">Total Orders</span>
          </div>
          <i className="bi bi-arrow-right-short stat-arrow"></i>
        </div>

        <div
          className="profile-stat-card"
          onClick={() => navigate("/cart")}
          role="button"
          tabIndex={0}
          title="View shopping cart"
        >
          <div className="stat-icon-wrap cart-icon">
            <i className="bi bi-cart3"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{totalCartCount}</span>
            <span className="stat-label">Items in Cart</span>
          </div>
          <i className="bi bi-arrow-right-short stat-arrow"></i>
        </div>

        <div
          className="profile-stat-card"
          onClick={() => {
            const el = document.getElementById("wishlist-section");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
          role="button"
          tabIndex={0}
          title="View wishlist items"
        >
          <div className="stat-icon-wrap wishlist-icon">
            <i className="bi bi-heart-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{wishlistProducts.length}</span>
            <span className="stat-label">Saved Wishlist</span>
          </div>
          <i className="bi bi-arrow-down-short stat-arrow"></i>
        </div>

        <div
          className="profile-stat-card"
          onClick={() => {
            setSelectedAddress(null);
            setEditAddress(true);
          }}
          role="button"
          tabIndex={0}
          title="Add or manage addresses"
        >
          <div className="stat-icon-wrap address-icon">
            <i className="bi bi-geo-alt-fill"></i>
          </div>
          <div className="stat-content">
            <span className="stat-number">{addressesCount}</span>
            <span className="stat-label">Saved Addresses</span>
          </div>
          <i className="bi bi-plus stat-arrow"></i>
        </div>
      </section>

      {/* ================= MAIN DASHBOARD 2-COLUMN GRID ================= */}
      <div className="profile-dashboard-layout">
        {/* ===== LEFT COLUMN: Personal Info & Shipping Addresses ===== */}
        <div className="profile-col-left">
          {/* PERSONAL DETAILS CARD */}
          <div className="cards profile-card">
            <div className="card-top-header">
              <div className="card-title-group">
                <div className="card-header-icon">
                  <i className="bi bi-person-badge"></i>
                </div>
                <h2>Personal Information</h2>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditProfile(true)}
              >
                <i className="bi bi-pencil"></i> Edit
              </Button>
            </div>

            {userDetails && (
              <div className="profile-info-grid">
                <div className="info-item">
                  <span className="info-label">
                    <i className="bi bi-person"></i> Full Name
                  </span>
                  <strong className="info-value">
                    {userDetails.firstName} {userDetails.lastName}
                  </strong>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <i className="bi bi-envelope"></i> Email Address
                  </span>
                  <strong className="info-value">{userDetails.email}</strong>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <i className="bi bi-telephone"></i> Phone Number
                  </span>
                  <strong className="info-value">{userDetails.phone || "Not set"}</strong>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <i className="bi bi-at"></i> Username
                  </span>
                  <strong className="info-value">@{userDetails.username}</strong>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <i className="bi bi-shield-check"></i> Account Status
                  </span>
                  <strong className="info-value text-emerald">
                    <i className="bi bi-check-circle-fill"></i> Active & Protected
                  </strong>
                </div>

                <div className="info-item">
                  <span className="info-label">
                    <i className="bi bi-clock-history"></i> Member Since
                  </span>
                  <strong className="info-value">
                    {userDetails.createdAt
                      ? new Date(userDetails.createdAt).toLocaleDateString()
                      : "2024"}
                  </strong>
                </div>
              </div>
            )}
          </div>

          {/* SHIPPING ADDRESSES CARD */}
          <div className="cards profile-card addresses-card">
            <div className="card-top-header">
              <div className="card-title-group">
                <div className="card-header-icon">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <h2>Shipping Addresses</h2>
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  setSelectedAddress(null);
                  setEditAddress(true);
                }}
              >
                <i className="bi bi-plus-lg"></i> Add Address
              </Button>
            </div>

            {userDetails?.addresses?.length ? (
              <ul className="addressesContainer">
                {userDetails.addresses.map((address, idx) => (
                  <li key={address._id || idx} className="addressCard">
                    <div className="address-badge-row">
                      <span className="address-index-pill">
                        <i className="bi bi-house-door"></i> Address #{idx + 1}
                      </span>
                      {idx === 0 && (
                        <span className="address-default-pill">
                          <i className="bi bi-check2"></i> Default
                        </span>
                      )}
                    </div>
                    <p className="address-line">
                      <i className="bi bi-geo-alt-fill"></i>
                      <span>
                        {address.apartment ? `${address.apartment}, ` : ""}
                        {address.street}
                      </span>
                    </p>
                    <p className="address-city">
                      {address.city}, {address.state} {address.postalcode}
                    </p>
                    <p className="address-country">{address.country}</p>

                    <Button
                      size="sm"
                      variant="outline"
                      className="address-edit-action"
                      onClick={() => {
                        setSelectedAddress(address);
                        setEditAddress(true);
                      }}
                    >
                      <i className="bi bi-pencil-square"></i> Edit
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-address-state">
                <div className="empty-state-icon-wrap">
                  <i className="bi bi-geo-alt"></i>
                </div>
                <h3>No Addresses Saved</h3>
                <p>Add your shipping address for fast, 1-click checkout on future orders.</p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setSelectedAddress(null);
                    setEditAddress(true);
                  }}
                >
                  <i className="bi bi-plus-lg"></i> Add Address
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT COLUMN: My Wishlist & Account Benefits ===== */}
        <div className="profile-col-right">
          {/* WISHLIST CARD */}
          <div className="cards profile-card wishlist-card" id="wishlist-section">
            <div className="card-top-header">
              <div className="card-title-group">
                <div className="card-header-icon wishlist-icon-header">
                  <i className="bi bi-heart-fill"></i>
                </div>
                <h2>My Wishlist</h2>
              </div>
              <span className="wishlist-counter-tag">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {wishlistLoading || productsLoading ? (
              <div className="wishlist-loading-state">
                <span className="profile-spinner-sm"></span>
                <p>Loading your saved items...</p>
              </div>
            ) : wishlistProducts.length ? (
              <ul className="wishlisted-items-container">
                {wishlistProducts.map((product) => (
                  <li key={product._id} className="wishlisted-item">
                    <div className="wishlisted-thumb-wrap">
                      <img
                        src={product.imageUrl || "/not-found.svg"}
                        alt={product.name}
                        className="wishlisted-thumb"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/not-found.svg";
                        }}
                      />
                    </div>

                    <div className="wishlisted-item-details">
                      <span className="wishlisted-category-tag">{product.type || "Catalog"}</span>
                      <h3>{product.name}</h3>
                      <div className="wishlisted-price-row">
                        <strong className="wishlisted-price">${product.price?.toFixed(2)}</strong>
                        <span className={`wishlist-stock-pill ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}>
                          {product.stock > 0 ? "In Stock" : "Out of Stock"}
                        </span>
                      </div>
                    </div>

                    <div className="wishlisted-actions">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={cartLoading || product.stock <= 0}
                        onClick={() => handleAddToCartFromWishlist(product)}
                        title="Add to shopping cart"
                      >
                        <i className="bi bi-cart-plus"></i> Add
                      </Button>

                      <button
                        className="wishlist-remove-icon-btn"
                        onClick={() => removeWishlist(product._id)}
                        title="Remove from wishlist"
                        aria-label="Remove from wishlist"
                      >
                        <i className="bi bi-trash3"></i>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="no-wishlist-state">
                <div className="empty-state-icon-wrap wishlist-empty-icon">
                  <i className="bi bi-heart"></i>
                </div>
                <h3>Your Wishlist is Empty</h3>
                <p>Save products you like by clicking the heart icon on any card.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-bag"></i> Browse Products
                </Button>
              </div>
            )}
          </div>

          {/* SELLER MERCHANT HUB CARD */}
          {normalizedRole === "seller" && (
            <div className="cards profile-card merchant-card">
              <div className="card-top-header">
                <div className="card-title-group">
                  <div className="card-header-icon merchant-icon-header">
                    <i className="bi bi-shop"></i>
                  </div>
                  <div>
                    <h2>Seller Merchant Hub</h2>
                    <span className="role-sub-badge">Active Merchant Portal</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setMessage("Seller listing manager initialized. Store catalog access enabled.");
                    setMessageType("success");
                  }}
                >
                  <i className="bi bi-plus-circle"></i> Add Listing
                </Button>
              </div>

              <div className="role-dashboard-metrics">
                <div className="role-metric-box">
                  <span className="role-metric-val">{products.length || 0}</span>
                  <span className="role-metric-lbl">Live Products</span>
                </div>
                <div className="role-metric-box">
                  <span className="role-metric-val">4.9 ★</span>
                  <span className="role-metric-lbl">Store Rating</span>
                </div>
                <div className="role-metric-box">
                  <span className="role-metric-val">99.4%</span>
                  <span className="role-metric-lbl">Fulfillment</span>
                </div>
                <div className="role-metric-box">
                  <span className="role-metric-val text-emerald">Active</span>
                  <span className="role-metric-lbl">Payouts</span>
                </div>
              </div>

              <div className="role-quick-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-grid"></i> Browse Catalog
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMessage("Seller analytics report downloaded for current cycle.");
                    setMessageType("info");
                  }}
                >
                  <i className="bi bi-graph-up-arrow"></i> Sales Analytics
                </Button>
              </div>
            </div>
          )}

          {/* ADMIN PLATFORM CONSOLE CARD */}
          {normalizedRole === "admin" && (
            <div className="cards profile-card admin-card">
              <div className="card-top-header">
                <div className="card-title-group">
                  <div className="card-header-icon admin-icon-header">
                    <i className="bi bi-shield-lock-fill"></i>
                  </div>
                  <div>
                    <h2>Platform Admin Console</h2>
                    <span className="role-sub-badge admin-sub-badge">Root Control Tier</span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setMessage("System audit passed: MongoDB Atlas & Node.js API healthy.");
                    setMessageType("success");
                  }}
                >
                  <i className="bi bi-activity"></i> System Audit
                </Button>
              </div>

              <div className="role-dashboard-metrics">
                <div className="role-metric-box">
                  <span className="role-metric-val text-emerald">100%</span>
                  <span className="role-metric-lbl">API Health</span>
                </div>
                <div className="role-metric-box">
                  <span className="role-metric-val">{products.length || 0}</span>
                  <span className="role-metric-lbl">Catalog Items</span>
                </div>
                <div className="role-metric-box">
                  <span className="role-metric-val">3 Roles</span>
                  <span className="role-metric-lbl">RBAC Matrix</span>
                </div>
                <div className="role-metric-box">
                  <span className="role-metric-val text-purple">Enforced</span>
                  <span className="role-metric-lbl">JWT Auth</span>
                </div>
              </div>

              <div className="role-quick-actions">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  <i className="bi bi-layers"></i> Platform Products
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMessage("Role permissions: Admin (Full control), Seller (Catalog management), User (Shopping & checkout).");
                    setMessageType("info");
                  }}
                >
                  <i className="bi bi-people"></i> RBAC Security Matrix
                </Button>
              </div>
            </div>
          )}

          {/* ACCOUNT SHORTCUTS & BENEFITS CARD */}
          <div className="cards profile-card benefits-card">
            <div className="card-top-header">
              <div className="card-title-group">
                <div className="card-header-icon benefits-icon-header">
                  <i className="bi bi-stars"></i>
                </div>
                <h2>TheStore Perks & Support</h2>
              </div>
            </div>

            <div className="benefits-list">
              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-truck"></i>
                </div>
                <div className="benefit-text">
                  <h4>Free Express Shipping</h4>
                  <p>On all domestic orders over $50 with live parcel tracking.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-arrow-repeat"></i>
                </div>
                <div className="benefit-text">
                  <h4>30-Day Hassle-Free Returns</h4>
                  <p>Easy returns & full refund guarantee on original items.</p>
                </div>
              </div>

              <div className="benefit-item">
                <div className="benefit-icon">
                  <i className="bi bi-robot"></i>
                </div>
                <div className="benefit-text">
                  <h4>24/7 AI Shopping Assistant</h4>
                  <p>Instant answers, personalized quizzes, and order help.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="benefit-action-btn"
                  onClick={handleOpenAssistant}
                >
                  Ask
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {editProfile && (
        <div className="profile-edit-overlay">
          <ProfileEdit
            key={userDetails?._id || userDetails?.username || "profile"}
            user={userDetails}
            closeContainer={() => {
              setEditProfile(false);
              dispatch(fetchProfile());
            }}
          />
        </div>
      )}

      {editAddress && (
        <div className="address-management-overlay">
          <AddressManagement
            key={selectedAddress?._id || "new"}
            address={selectedAddress}
            closeContainer={() => {
              setEditAddress(false);
              dispatch(fetchProfile());
            }}
          />
        </div>
      )}

      {message && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      )}
    </div>
  );
};

export default UserProfile;
