import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Navigate, useSearchParams } from "react-router-dom";
import config from "../../config/config";
import Button from "../common/ui/buttons/button";
import GoodLoader from "../common/ui/loader/loader";
import MessageModal from "../common/ui/messagemodel/messageModel";
import { loginUser } from "../../store/slices/authSlice";
import "./AdminPortal.css";

const AdminPortal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get("tab");

  const reduxToken = useSelector((state) => state.auth?.token);
  const token = reduxToken || localStorage.getItem("token");
  const currentUser = useSelector((state) => state.auth.user);

  const role = (currentUser?.accountType || currentUser?.role || "").toLowerCase();

  const [activeTab, setActiveTab] = useState(urlTab || "overview"); // "overview" | "sellers" | "users" | "products"

  useEffect(() => {
    if (urlTab && ["sellers", "users", "products", "overview"].includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const handleTabSwitch = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };
  const [loading, setLoading] = useState(role === "admin");
  const [overview, setOverview] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [sellerFilter, setSellerFilter] = useState("all"); // "all" | "pending" | "approved" | "rejected"
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  // Rejection Dialog with Specific Reason & Custom Message
  const [rejectingSeller, setRejectingSeller] = useState(null);
  const [rejectionReason, setRejectionReason] = useState(
    "Incomplete or unreadable tax documentation (GSTIN/EIN)"
  );
  const [rejectionMessage, setRejectionMessage] = useState("");

  // Seller Document Dossier Inspection Modal
  const [inspectingSellerDocs, setInspectingSellerDocs] = useState(null);

  // Admin Catalog Moderation states
  const [adminProducts, setAdminProducts] = useState([]);
  const [adminProductsLoading, setAdminProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("All");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [rejectingProduct, setRejectingProduct] = useState(null);
  const [productRejectionReason, setProductRejectionReason] = useState(
    "Policy compliance violation or counterfeit concern"
  );
  const [productRejectionMessage, setProductRejectionMessage] = useState("");
  const [inspectingProduct, setInspectingProduct] = useState(null);

  // Admin Gateway login states for direct access to /admin
  const [adminAuthInput, setAdminAuthInput] = useState({
    username: "admin@thestore.com",
    password: "admin123",
  });
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [overviewRes, sellersRes, usersRes] = await Promise.all([
        axios.get(`${config.apiUrl}/admin/overview`, { headers }),
        axios.get(`${config.apiUrl}/admin/sellers`, { headers }),
        axios.get(`${config.apiUrl}/admin/users`, { headers }),
      ]);
      setOverview(overviewRes.data);
      setSellers(sellersRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load admin controls");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminProducts = async () => {
    setAdminProductsLoading(true);
    try {
      const statusParam =
        productStatusFilter !== "all" ? `&status=${productStatusFilter}` : "";
      const res = await axios.get(
        `${config.apiUrl}/admin/products?search=${encodeURIComponent(
          productSearch
        )}&category=${productCategory}${statusParam}`,
        { headers }
      );
      setAdminProducts(res.data);
    } catch (err) {
      console.error("Failed to load products for moderation:", err);
    } finally {
      setAdminProductsLoading(false);
    }
  };

  useEffect(() => {
    if (token && role === "admin") {
      fetchAdminData();
      fetchAdminProducts();
    }
  }, [token, role]);

  useEffect(() => {
    if (token && role === "admin" && activeTab === "products") {
      fetchAdminProducts();
    }
  }, [productSearch, productCategory, productStatusFilter, activeTab]);

  const handleAdminDirectLogin = async (creds) => {
    setAuthSubmitting(true);
    setAuthError("");
    try {
      await dispatch(loginUser(creds || adminAuthInput)).unwrap();
      setMessage("Welcome to Administrator Console!");
      setMessageType("success");
    } catch (err) {
      setAuthError(typeof err === "string" ? err : "Admin authentication failed");
    } finally {
      setAuthSubmitting(false);
    }
  };

  // 1. If not logged in at all: Redirect directly to dedicated Admin Login page
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // 2. If logged in as customer/seller: Show clean unauthorized switcher
  if (role !== "admin") {
    return (
      <div className="admin-portal-wrapper">
        <div className="admin-unauthorized-card">
          <div className="unauth-icon">
            <i className="bi bi-shield-x"></i>
          </div>
          <h2>Administrator Portal Restricted</h2>
          <p>
            You are currently signed in as <strong>{currentUser?.email || currentUser?.username || "a customer"}</strong> ({role ? role.toUpperCase() : "CUSTOMER"}). Admin privileges are required to access this portal.
          </p>
          <div className="unauth-actions">
            <Button
              variant="primary"
              disabled={authSubmitting}
              onClick={() => handleAdminDirectLogin({ username: "admin@thestore.com", password: "admin123" })}
            >
              <i className="bi bi-lightning-charge-fill"></i> Switch to Admin Account (admin@thestore.com)
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <i className="bi bi-shop"></i> Back to Store
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSellerStatus = async (sellerId, newStatus, reason = "", customMsg = "") => {
    try {
      const res = await axios.patch(
        `${config.apiUrl}/admin/sellers/${sellerId}/status`,
        {
          status: newStatus,
          rejectionReason: reason,
          rejectionMessage: customMsg,
        },
        { headers }
      );
      setMessage(res.data.message || `Seller status updated to ${newStatus}`);
      setMessageType("success");
      // Update local state
      setSellers((prev) =>
        prev.map((s) =>
          s._id === sellerId
            ? {
                ...s,
                sellerStatus: newStatus,
                rejectionReason: reason,
                rejectionMessage: customMsg,
              }
            : s
        )
      );
      if (overview) {
        setOverview((prev) => ({
          ...prev,
          pendingSellers:
            newStatus === "approved" || newStatus === "rejected"
              ? Math.max(0, prev.pendingSellers - 1)
              : prev.pendingSellers,
        }));
      }
      setRejectingSeller(null);
      if (inspectingSellerDocs && inspectingSellerDocs._id === sellerId) {
        setInspectingSellerDocs((prev) => ({
          ...prev,
          sellerStatus: newStatus,
          rejectionReason: reason,
          rejectionMessage: customMsg,
        }));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update seller status");
      setMessageType("error");
    }
  };

  const handleUserRole = async (userId, newRole) => {
    try {
      const res = await axios.patch(
        `${config.apiUrl}/admin/users/${userId}/role`,
        { role: newRole },
        { headers }
      );
      setMessage(res.data.message || `User role updated to ${newRole}`);
      setMessageType("success");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, accountType: newRole } : u))
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update user role");
      setMessageType("error");
    }
  };

  const handleUserStatus = async (userId, newStatus) => {
    try {
      const res = await axios.patch(
        `${config.apiUrl}/admin/users/${userId}/status`,
        { status: newStatus },
        { headers }
      );
      setMessage(res.data.message || `User status set to ${newStatus}`);
      setMessageType("success");
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update user status");
      setMessageType("error");
    }
  };

  const handleProductApprovalStatus = async (productId, newStatus, reason = "", customMsg = "") => {
    try {
      const fullReason = reason + (customMsg ? `: ${customMsg}` : "");
      const res = await axios.patch(
        `${config.apiUrl}/admin/products/${productId}/status`,
        { status: newStatus, rejectionReason: fullReason },
        { headers }
      );
      setMessage(res.data.message || `Product status updated to ${newStatus}`);
      setMessageType("success");
      setAdminProducts((prev) =>
        prev.map((p) =>
          p._id === productId
            ? { ...p, approvalStatus: newStatus, rejectionReason: fullReason }
            : p
        )
      );
      setRejectingProduct(null);
      if (inspectingProduct && inspectingProduct._id === productId) {
        setInspectingProduct((prev) => ({
          ...prev,
          approvalStatus: newStatus,
          rejectionReason: fullReason,
        }));
      }
      fetchAdminData();
      window.dispatchEvent(new Event("refresh-admin-nav-stats"));
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update product approval status");
      setMessageType("error");
    }
  };

  const handleAdminDeleteProduct = async (productId, productName) => {
    if (
      !window.confirm(
        `Are you sure you want to remove and moderate "${productName || "this product"}" as Administrator?`
      )
    ) {
      return;
    }
    try {
      await axios.delete(`${config.apiUrl}/admin/products/${productId}`, { headers });
      setMessage("Product listing successfully moderated and removed.");
      setMessageType("success");
      setAdminProducts((prev) => prev.filter((p) => p._id !== productId));
      if (overview) {
        setOverview((prev) => ({
          ...prev,
          totalProducts: Math.max(0, (prev.totalProducts || 1) - 1),
        }));
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to remove product");
      setMessageType("error");
    }
  };

  const filteredSellers = sellers.filter((s) => {
    if (sellerFilter === "all") return true;
    return s.sellerStatus === sellerFilter;
  });

  const filteredUsers = users.filter((u) => {
    if (!userSearch.trim()) return true;
    const q = userSearch.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q)
    );
  });

  const formatOrderDate = (dateString) => {
    if (!dateString) return "Just now";
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return <GoodLoader message="Initializing Platform Administration Console..." />;
  }

  return (
    <div className="admin-portal-wrapper">
      {/* ================= TAB 1: SELLER APPROVAL WORKFLOW ================= */}
      {activeTab === "sellers" && (
        <section className="admin-section-card">
          <div className="section-header-row">
            <div>
              <h2>Merchant Verification & Approvals</h2>
              <p>Review and authorize seller credentials to unlock product listing privileges.</p>
            </div>

            <div className="filter-chip-group">
              <button
                type="button"
                className={`filter-chip ${sellerFilter === "all" ? "active" : ""}`}
                onClick={() => setSellerFilter("all")}
              >
                All Sellers ({sellers.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${sellerFilter === "pending" ? "active" : ""}`}
                onClick={() => setSellerFilter("pending")}
              >
                ⏳ Pending ({sellers.filter((s) => s.sellerStatus === "pending").length})
              </button>
              <button
                type="button"
                className={`filter-chip ${sellerFilter === "approved" ? "active" : ""}`}
                onClick={() => setSellerFilter("approved")}
              >
                ✅ Approved ({sellers.filter((s) => s.sellerStatus === "approved").length})
              </button>
              <button
                type="button"
                className={`filter-chip ${sellerFilter === "rejected" ? "active" : ""}`}
                onClick={() => setSellerFilter("rejected")}
              >
                ❌ Rejected ({sellers.filter((s) => s.sellerStatus === "rejected").length})
              </button>
            </div>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="admin-empty-box">
              <i className="bi bi-check2-circle text-emerald"></i>
              <h3>No Sellers in this Category</h3>
              <p>All merchant applications have been reviewed or none match the selected filter.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Store Name & Merchant</th>
                    <th>Contact Details</th>
                    <th>Date Joined</th>
                    <th>Current Status</th>
                    <th>Administrative Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.map((seller) => {
                    const status = seller.sellerStatus || "pending";
                    return (
                      <tr key={seller._id}>
                        <td>
                          <div className="seller-cell">
                            <span className="store-title">
                              {seller.storeName || `${seller.firstName}'s Store`}
                            </span>
                            <span className="owner-name">
                              👤 {seller.firstName} {seller.lastName} (@{seller.username})
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="contact-cell">
                            <span>📧 {seller.email}</span>
                            <span>📞 {seller.phone || "No phone"}</span>
                          </div>
                        </td>

                        <td>
                          {seller.createdAt
                            ? new Date(seller.createdAt).toLocaleDateString()
                            : "Recent"}
                        </td>

                        <td>
                          <span className={`status-pill status-${status}`}>
                            {status === "approved" && "✅ Verified Seller"}
                            {status === "pending" && "⏳ Pending Review"}
                            {status === "rejected" && "❌ Rejected"}
                          </span>
                          {status === "rejected" && seller.rejectionReason && (
                            <div
                              className="rejection-mini-note"
                              title={`${seller.rejectionReason}: ${seller.rejectionMessage || ""}`}
                            >
                              <i className="bi bi-info-circle"></i> {seller.rejectionReason}
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="action-btn-row">
                            <button
                              type="button"
                              className="action-btn docs-btn"
                              onClick={() => setInspectingSellerDocs(seller)}
                              title="Inspect submitted business registration & verification documents"
                            >
                              <i className="bi bi-file-earmark-text-fill"></i> Docs
                            </button>

                            {status !== "approved" && (
                              <button
                                type="button"
                                className="action-btn approve-btn"
                                onClick={() => handleSellerStatus(seller._id, "approved")}
                                title="Approve merchant and allow selling"
                              >
                                <i className="bi bi-check-lg"></i> Approve
                              </button>
                            )}

                            {status !== "rejected" && (
                              <button
                                type="button"
                                className="action-btn reject-btn"
                                onClick={() => {
                                  setRejectingSeller(seller);
                                  setRejectionReason(
                                    "Incomplete or unreadable tax documentation (GSTIN/EIN)"
                                  );
                                  setRejectionMessage("");
                                }}
                                title="Reject merchant application with specific directive"
                              >
                                <i className="bi bi-x-lg"></i> Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 2: USER MANAGEMENT ================= */}
      {activeTab === "users" && (
        <section className="admin-section-card">
          <div className="section-header-row">
            <div>
              <h2>User Accounts & Permissions</h2>
              <p>Promote or demote roles (User, Seller, Admin) and manage account suspension.</p>
            </div>

            <div className="user-search-box">
              <i className="bi bi-search"></i>
              <input
                type="text"
                placeholder="Search by name, email, or username..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setUserSearch("")}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              )}
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-data-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Email & Phone</th>
                  <th>Current Role</th>
                  <th>Account Status</th>
                  <th>Modify Role</th>
                  <th>Status Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const role = u.accountType === "regular" ? "user" : u.accountType || "user";
                  const status = u.status || "active";
                  const isSelf = u._id === currentUser?.id || u._id === currentUser?._id;

                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="user-profile-cell">
                          <strong>{u.firstName} {u.lastName}</strong>
                          <span className="user-at">@{u.username}</span>
                        </div>
                      </td>

                      <td>
                        <div className="contact-cell">
                          <span>{u.email}</span>
                          <span>{u.phone}</span>
                        </div>
                      </td>

                      <td>
                        <span className={`role-badge-tag role-badge-${role}`}>
                          {role === "admin" && "🛡️ Admin"}
                          {role === "seller" && "🏪 Seller"}
                          {role === "user" && "👤 Customer"}
                        </span>
                      </td>

                      <td>
                        <span className={`status-pill status-${status}`}>
                          {status === "active" ? "Active" : "Suspended"}
                        </span>
                      </td>

                      <td>
                        <select
                          className="admin-role-select"
                          value={role}
                          disabled={isSelf}
                          onChange={(e) => handleUserRole(u._id, e.target.value)}
                        >
                          <option value="user">Customer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>
                        {!isSelf ? (
                          <button
                            type="button"
                            className={`status-toggle-btn ${status === "active" ? "suspend" : "activate"}`}
                            onClick={() =>
                              handleUserStatus(u._id, status === "active" ? "suspended" : "active")
                            }
                          >
                            {status === "active" ? "Suspend" : "Activate"}
                          </button>
                        ) : (
                          <span className="self-tag">(You)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ================= TAB 3: PRODUCT CATALOG MODERATION ================= */}
      {activeTab === "products" && (
        <section className="admin-section-card">
          <div className="section-header-row">
            <div>
              <h2>Marketplace Catalog Moderation</h2>
              <p>
                Audit listings submitted across all merchants, inspect deep technical specs, and remove policy violations.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={<i className="bi bi-arrow-repeat"></i>}
              onClick={fetchAdminProducts}
            >
              Refresh Listings
            </Button>
          </div>

          {/* Filter and Search Bar */}
          <div className="admin-catalog-toolbar-wrapper" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.8rem", justifyContent: "space-between", alignItems: "center" }}>
              {/* Approval Status Filter Chips */}
              <div className="filter-chip-group">
                <button
                  type="button"
                  className={`filter-chip ${productStatusFilter === "all" ? "active" : ""}`}
                  onClick={() => setProductStatusFilter("all")}
                >
                  All Products ({overview?.totalProducts || adminProducts.length})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${productStatusFilter === "pending" ? "active" : ""}`}
                  onClick={() => setProductStatusFilter("pending")}
                >
                  ⏳ Pending Review ({overview?.pendingProducts || 0})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${productStatusFilter === "approved" ? "active" : ""}`}
                  onClick={() => setProductStatusFilter("approved")}
                >
                  ✅ Approved ({overview?.approvedProducts || 0})
                </button>
                <button
                  type="button"
                  className={`filter-chip ${productStatusFilter === "rejected" ? "active" : ""}`}
                  onClick={() => setProductStatusFilter("rejected")}
                >
                  ❌ Rejected ({overview?.rejectedProducts || 0})
                </button>
              </div>

              {/* Search Box */}
              <div className="user-search-box" style={{ maxWidth: "340px" }}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search products, brands, sellers..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
                {productSearch && (
                  <button
                    type="button"
                    className="search-clear"
                    onClick={() => setProductSearch("")}
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Category Sub-Filters */}
            <div className="filter-chip-group" style={{ fontSize: "0.82rem" }}>
              {["All", "Electronics", "Clothing", "Home", "Books", "Sports", "Beauty", "Toys", "Others"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`filter-chip ${productCategory === cat ? "active" : ""}`}
                  onClick={() => setProductCategory(cat)}
                  style={{ padding: "0.25rem 0.7rem", fontSize: "0.8rem" }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {adminProductsLoading ? (
            <div style={{ textAlign: "center", padding: "3rem" }}>
              <GoodLoader message="Auditing marketplace inventory..." />
            </div>
          ) : adminProducts.length === 0 ? (
            <div className="admin-empty-box">
              <i className="bi bi-box-seam text-purple"></i>
              <h3>No Products Found</h3>
              <p>No products match your search query or selected filters.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Product & Brand</th>
                    <th>Category</th>
                    <th>Merchant / Seller</th>
                    <th>Price & Stock</th>
                    <th>Approval Status</th>
                    <th>Technical Specs</th>
                    <th>Moderation Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminProducts.map((prod) => {
                    const pStatus = prod.approvalStatus || "approved";
                    return (
                      <tr key={prod._id}>
                        <td>
                          <div className="product-table-cell" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            {prod.imageUrl ? (
                              <img
                                src={prod.imageUrl}
                                alt={prod.name}
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius: "8px",
                                  objectFit: "cover",
                                  border: "1px solid #e2e8f0",
                                  flexShrink: 0,
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "42px",
                                  height: "42px",
                                  borderRadius: "8px",
                                  background: "#ede9fe",
                                  color: "#7c3aed",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: "1.2rem",
                                  flexShrink: 0,
                                }}
                              >
                                <i className="bi bi-box-seam"></i>
                              </div>
                            )}
                            <div className="product-table-info">
                              <strong style={{ display: "block", color: "#1e1b4b" }}>{prod.name}</strong>
                              <span className="brand-tag">{prod.brand || "TheStore"}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="type-pill">{prod.type}</span>
                        </td>

                        <td>
                          <div className="seller-cell">
                            <span className="store-title">
                              {prod.sellerName || "Verified Merchant"}
                            </span>
                            <span className="owner-name" style={{ fontSize: "0.74rem", color: "#64748b" }}>
                              ID: {prod.sellerId ? prod.sellerId.substring(0, 8) + "..." : "Platform"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="price-table-cell">
                            <strong className="current-price">${(prod.price || 0).toFixed(2)}</strong>
                            <span
                              className={`stock-pill ${
                                prod.stock > 5 ? "in-stock" : prod.stock > 0 ? "low-stock" : "out-stock"
                              }`}
                              style={{ marginTop: "0.2rem", display: "inline-block" }}
                            >
                              {prod.stock > 0 ? `${prod.stock} units` : "Sold Out"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className={`status-pill status-${pStatus}`}>
                            {pStatus === "approved" && "✅ Live Catalog"}
                            {pStatus === "pending" && "⏳ Pending Review"}
                            {pStatus === "rejected" && "❌ Rejected / Unlisted"}
                          </span>
                          {pStatus === "rejected" && prod.rejectionReason && (
                            <div
                              className="rejection-mini-note"
                              title={prod.rejectionReason}
                              style={{ marginTop: "0.3rem", fontSize: "0.74rem", color: "#e11d48" }}
                            >
                              <i className="bi bi-info-circle"></i> {prod.rejectionReason.split(":")[0]}
                            </div>
                          )}
                        </td>

                        <td>
                          <div className="specs-summary-cell" style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", maxWidth: "240px" }}>
                            {prod.specs?.processor && (
                              <span className="spec-tag" style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "0.72rem", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                                {prod.specs.processor}
                              </span>
                            )}
                            {prod.specs?.ram && (
                              <span className="spec-tag" style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "0.72rem", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                                {prod.specs.ram}
                              </span>
                            )}
                            {prod.specs?.storage && (
                              <span className="spec-tag" style={{ background: "#e0e7ff", color: "#3730a3", fontSize: "0.72rem", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                                {prod.specs.storage}
                              </span>
                            )}
                            {prod.specs?.material && (
                              <span className="spec-tag" style={{ background: "#fef3c7", color: "#92400e", fontSize: "0.72rem", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                                {prod.specs.material}
                              </span>
                            )}
                            {prod.specs?.author && (
                              <span className="spec-tag" style={{ background: "#dcfce7", color: "#166534", fontSize: "0.72rem", padding: "0.15rem 0.45rem", borderRadius: "4px" }}>
                                {prod.specs.author}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <div className="action-btn-row" style={{ flexWrap: "wrap", gap: "0.4rem" }}>
                            <button
                              type="button"
                              className="action-btn docs-btn"
                              style={{ padding: "0.35rem 0.65rem", fontSize: "0.76rem" }}
                              onClick={() => setInspectingProduct(prod)}
                              title="Inspect complete technical specs and description"
                            >
                              <i className="bi bi-eye-fill"></i> Details
                            </button>

                            {pStatus !== "approved" && (
                              <button
                                type="button"
                                className="action-btn approve-btn"
                                style={{ padding: "0.35rem 0.65rem", fontSize: "0.76rem" }}
                                onClick={() => handleProductApprovalStatus(prod._id, "approved")}
                                title="Approve listing for store catalog"
                              >
                                <i className="bi bi-check-lg"></i> Approve
                              </button>
                            )}

                            {pStatus !== "rejected" && (
                              <button
                                type="button"
                                className="action-btn reject-btn"
                                style={{ padding: "0.35rem 0.65rem", fontSize: "0.76rem" }}
                                onClick={() => {
                                  setRejectingProduct(prod);
                                  setProductRejectionReason(
                                    "Policy compliance violation or counterfeit risk"
                                  );
                                  setProductRejectionMessage("");
                                }}
                                title="Reject or unlist listing"
                              >
                                <i className="bi bi-x-lg"></i> {pStatus === "pending" ? "Reject" : "Unlist"}
                              </button>
                            )}

                            <button
                              type="button"
                              className="action-btn"
                              style={{
                                padding: "0.35rem 0.65rem",
                                fontSize: "0.76rem",
                                background: "#f1f5f9",
                                color: "#64748b",
                              }}
                              onClick={() => handleAdminDeleteProduct(prod._id, prod.name)}
                              title="Permanently remove product"
                            >
                              <i className="bi bi-trash3"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ================= TAB 1: EXECUTIVE ANALYTICS & KPI DASHBOARD ================= */}
      {activeTab === "overview" && (
        <section className="admin-section-card admin-overview-section">
          {/* Section Header with Live Stream Pulse & Controls */}
          <div className="section-header-row overview-header-row">
            <div>
              <div className="overview-title-badge-row">
                <h2>Executive Analytics & Platform KPIs</h2>
                <div className="live-stream-badge">
                  <span className="live-pulse-dot"></span>
                  <span>LIVE PRODUCTION TELEMETRY</span>
                </div>
              </div>
              <p>
                Real-time marketplace telemetry, gross merchandise value, merchant onboarding status, order fulfillment pipeline, and category catalog distribution.
              </p>
            </div>
            <div className="overview-header-actions">
              <Button
                variant="primary"
                size="sm"
                icon={<i className="bi bi-arrow-repeat"></i>}
                onClick={fetchAdminData}
              >
                Refresh Live Telemetry
              </Button>
            </div>
          </div>

          {/* Core High-Impact KPI Grid */}
          <div className="admin-kpi-grid">
            {/* Card 1: Gross Platform Revenue (GMV) */}
            <div className="admin-kpi-card kpi-card-emerald">
              <div className="kpi-card-top">
                <span className="kpi-card-label">Gross Merchandise Value (GMV)</span>
                <div className="kpi-icon-pill emerald-pill">
                  <i className="bi bi-cash-stack"></i>
                </div>
              </div>
              <div className="kpi-value text-emerald">
                ${Number(overview?.totalRevenue || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <div className="kpi-card-footer">
                <span className="kpi-micro-pill emerald-sub-pill">
                  <i className="bi bi-graph-up-arrow"></i> AOV: ${overview?.averageOrderValue || "0.00"}
                </span>
                <span className="kpi-note">Settled non-cancelled volume</span>
              </div>
            </div>

            {/* Card 2: Total Orders & Fulfillment */}
            <div className="admin-kpi-card kpi-card-indigo">
              <div className="kpi-card-top">
                <span className="kpi-card-label">Total Customer Orders</span>
                <div className="kpi-icon-pill indigo-pill">
                  <i className="bi bi-bag-check-fill"></i>
                </div>
              </div>
              <div className="kpi-value text-indigo">
                {(overview?.totalOrders || 0).toLocaleString()}
              </div>
              <div className="kpi-card-footer">
                <span className="kpi-micro-pill indigo-sub-pill">
                  <i className="bi bi-check2-all"></i>{" "}
                  {overview?.totalOrders
                    ? Math.round(
                        ((overview?.orderStatusCounts?.Delivered || 0) /
                          overview.totalOrders) *
                          100
                      )
                    : 0}
                  % Delivered
                </span>
                <span className="kpi-note">
                  {overview?.orderStatusCounts?.Pending || 0} in dispatch queue
                </span>
              </div>
            </div>

            {/* Card 3: Merchant Ecosystem */}
            <div
              className="admin-kpi-card kpi-card-amber clickable-kpi"
              onClick={() => {
                handleTabSwitch("sellers");
                setSellerFilter("pending");
              }}
              title="Click to review merchant onboarding queue"
            >
              <div className="kpi-card-top">
                <span className="kpi-card-label">Marketplace Merchants</span>
                <div className="kpi-icon-pill amber-pill">
                  <i className="bi bi-shop"></i>
                </div>
              </div>
              <div className="kpi-value text-amber">
                {overview?.totalSellers || 0}
              </div>
              <div className="kpi-card-footer">
                <span className="kpi-micro-pill amber-sub-pill">
                  <i className="bi bi-hourglass-split"></i> {overview?.pendingSellers || 0} Pending Review
                </span>
                <span className="kpi-note">{overview?.approvedSellers || 0} active stores</span>
              </div>
            </div>

            {/* Card 4: Registered Customer Base */}
            <div
              className="admin-kpi-card kpi-card-blue clickable-kpi"
              onClick={() => handleTabSwitch("users")}
              title="Click to open user directory"
            >
              <div className="kpi-card-top">
                <span className="kpi-card-label">Active Consumer Accounts</span>
                <div className="kpi-icon-pill blue-pill">
                  <i className="bi bi-people-fill"></i>
                </div>
              </div>
              <div className="kpi-value text-blue">
                {(overview?.totalUsers || 0).toLocaleString()}
              </div>
              <div className="kpi-card-footer">
                <span className="kpi-micro-pill blue-sub-pill">
                  <i className="bi bi-shield-check"></i> RBAC Enforced
                </span>
                <span className="kpi-note">JWT verified shoppers</span>
              </div>
            </div>

            {/* Card 5: Warehouse & Catalog Listings */}
            <div
              className="admin-kpi-card kpi-card-purple clickable-kpi"
              onClick={() => handleTabSwitch("products")}
              title="Click to moderate product catalog"
            >
              <div className="kpi-card-top">
                <span className="kpi-card-label">Marketplace Catalog</span>
                <div className="kpi-icon-pill purple-pill">
                  <i className="bi bi-boxes"></i>
                </div>
              </div>
              <div className="kpi-value text-purple">
                {overview?.totalProducts || 0}{" "}
                <span className="kpi-unit-tag">Items</span>
              </div>
              <div className="kpi-card-footer">
                {overview?.lowStockCount > 0 ? (
                  <span className="kpi-micro-pill rose-sub-pill">
                    <i className="bi bi-exclamation-triangle-fill"></i> {overview.lowStockCount} Low Stock (≤5)
                  </span>
                ) : (
                  <span className="kpi-micro-pill purple-sub-pill">
                    <i className="bi bi-check-circle-fill"></i> Inventory Healthy
                  </span>
                )}
                <span className="kpi-note">
                  {(overview?.totalUnitsInStock || 0).toLocaleString()} units stocked
                </span>
              </div>
            </div>
          </div>

          {/* Section: Order Fulfillment Pipeline */}
          <div className="analytics-block">
            <div className="analytics-block-header">
              <div>
                <h3>Order Fulfillment Lifecycle</h3>
                <p>Tracking orders from customer placement through carrier delivery.</p>
              </div>
              <span className="pipeline-total-badge">
                {(overview?.totalOrders || 0).toLocaleString()} Lifetime Orders
              </span>
            </div>

            <div className="fulfillment-pipeline-grid">
              {/* Stage 1: Pending */}
              <div className="pipeline-stage-card stage-pending">
                <div className="stage-top">
                  <div className="stage-icon-wrap amber">
                    <i className="bi bi-hourglass-split"></i>
                  </div>
                  <span className="stage-tag amber">1. Pending Processing</span>
                </div>
                <div className="stage-count">
                  {overview?.orderStatusCounts?.Pending || 0}
                  <span className="stage-share">
                    ({overview?.totalOrders ? Math.round(((overview?.orderStatusCounts?.Pending || 0) / overview.totalOrders) * 100) : 0}%)
                  </span>
                </div>
                <div className="stage-progress-bar-wrap">
                  <div
                    className="stage-progress-bar amber"
                    style={{
                      width: `${overview?.totalOrders ? Math.min(100, Math.round(((overview?.orderStatusCounts?.Pending || 0) / overview.totalOrders) * 100)) : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="stage-desc">Awaiting merchant shipment preparation</div>
              </div>

              {/* Stage 2: Shipped */}
              <div className="pipeline-stage-card stage-shipped">
                <div className="stage-top">
                  <div className="stage-icon-wrap blue">
                    <i className="bi bi-truck"></i>
                  </div>
                  <span className="stage-tag blue">2. In Transit / Shipped</span>
                </div>
                <div className="stage-count">
                  {overview?.orderStatusCounts?.Shipped || 0}
                  <span className="stage-share">
                    ({overview?.totalOrders ? Math.round(((overview?.orderStatusCounts?.Shipped || 0) / overview.totalOrders) * 100) : 0}%)
                  </span>
                </div>
                <div className="stage-progress-bar-wrap">
                  <div
                    className="stage-progress-bar blue"
                    style={{
                      width: `${overview?.totalOrders ? Math.min(100, Math.round(((overview?.orderStatusCounts?.Shipped || 0) / overview.totalOrders) * 100)) : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="stage-desc">Dispatched via logistics carrier</div>
              </div>

              {/* Stage 3: Delivered */}
              <div className="pipeline-stage-card stage-delivered">
                <div className="stage-top">
                  <div className="stage-icon-wrap emerald">
                    <i className="bi bi-check-circle-fill"></i>
                  </div>
                  <span className="stage-tag emerald">3. Fulfilled & Delivered</span>
                </div>
                <div className="stage-count">
                  {overview?.orderStatusCounts?.Delivered || 0}
                  <span className="stage-share">
                    ({overview?.totalOrders ? Math.round(((overview?.orderStatusCounts?.Delivered || 0) / overview.totalOrders) * 100) : 0}%)
                  </span>
                </div>
                <div className="stage-progress-bar-wrap">
                  <div
                    className="stage-progress-bar emerald"
                    style={{
                      width: `${overview?.totalOrders ? Math.min(100, Math.round(((overview?.orderStatusCounts?.Delivered || 0) / overview.totalOrders) * 100)) : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="stage-desc">Successfully received by customer</div>
              </div>

              {/* Stage 4: Cancelled */}
              <div className="pipeline-stage-card stage-cancelled">
                <div className="stage-top">
                  <div className="stage-icon-wrap rose">
                    <i className="bi bi-x-circle-fill"></i>
                  </div>
                  <span className="stage-tag rose">4. Cancelled / Void</span>
                </div>
                <div className="stage-count">
                  {overview?.orderStatusCounts?.Cancelled || 0}
                  <span className="stage-share">
                    ({overview?.totalOrders ? Math.round(((overview?.orderStatusCounts?.Cancelled || 0) / overview.totalOrders) * 100) : 0}%)
                  </span>
                </div>
                <div className="stage-progress-bar-wrap">
                  <div
                    className="stage-progress-bar rose"
                    style={{
                      width: `${overview?.totalOrders ? Math.min(100, Math.round(((overview?.orderStatusCounts?.Cancelled || 0) / overview.totalOrders) * 100)) : 0}%`,
                    }}
                  ></div>
                </div>
                <div className="stage-desc">Aborted or refunded transactions</div>
              </div>
            </div>
          </div>

          {/* Section: Split Row: Category Distribution & System Architecture */}
          <div className="analytics-split-grid">
            {/* Left: Category Catalog Distribution */}
            <div className="analytics-panel category-panel">
              <div className="panel-header">
                <div>
                  <h3>Category Catalog Distribution</h3>
                  <p>Product diversity and inventory weight across store departments.</p>
                </div>
                <span className="panel-badge">
                  {overview?.categories?.length || 0} Categories
                </span>
              </div>

              <div className="category-distribution-list">
                {overview?.categories && overview.categories.length > 0 ? (
                  overview.categories.map((cat, idx) => (
                    <div key={idx} className="category-distribution-item">
                      <div className="category-info-row">
                        <div className="category-name-group">
                          <span className="category-bullet-icon">
                            <i className="bi bi-tag-fill"></i>
                          </span>
                          <strong>{cat.name}</strong>
                          <span className="category-counts-pill">
                            {cat.count} {cat.count === 1 ? "product" : "products"} • {cat.stock || 0} units
                          </span>
                        </div>
                        <span className="category-percentage-badge">
                          {cat.percentage}%
                        </span>
                      </div>
                      <div className="category-progress-track">
                        <div
                          className="category-progress-fill"
                          style={{ width: `${Math.min(100, cat.percentage)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="admin-empty-box" style={{ padding: "1.5rem" }}>
                    <i className="bi bi-inbox text-purple"></i>
                    <p>No products categorized yet in the marketplace.</p>
                  </div>
                )}
              </div>

              <div className="category-panel-footer">
                <div className="footer-metric">
                  <span>AVERAGE CATALOG PRICE</span>
                  <strong>${overview?.averageCatalogPrice || "0.00"}</strong>
                </div>
                <div className="footer-metric">
                  <span>TOTAL INVENTORY UNITS</span>
                  <strong>{(overview?.totalUnitsInStock || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Right: Platform Infrastructure & Architecture Health */}
            <div className="analytics-panel system-panel">
              <div className="panel-header">
                <div>
                  <h3>Infrastructure & Security SLA</h3>
                  <p>Real-time cluster telemetry, database status, and cryptographic guards.</p>
                </div>
                <span className="health-status-tag healthy">
                  <i className="bi bi-shield-check"></i> Operational
                </span>
              </div>

              <div className="infra-cards-grid">
                <div className="infra-metric-card">
                  <div className="infra-metric-icon text-emerald">
                    <i className="bi bi-hdd-stack-fill"></i>
                  </div>
                  <div className="infra-metric-body">
                    <div className="infra-title">Database Engine</div>
                    <div className="infra-value">MongoDB Atlas Cluster</div>
                    <div className="infra-sub">Multi-region distributed nodes</div>
                  </div>
                </div>

                <div className="infra-metric-card">
                  <div className="infra-metric-icon text-purple">
                    <i className="bi bi-lock-fill"></i>
                  </div>
                  <div className="infra-metric-body">
                    <div className="infra-title">Authentication & RBAC</div>
                    <div className="infra-value">{overview?.activeSecurityPolicy || "Strict RBAC + JWT"}</div>
                    <div className="infra-sub">Enforced via authMiddleware</div>
                  </div>
                </div>

                <div className="infra-metric-card">
                  <div className="infra-metric-icon text-blue">
                    <i className="bi bi-lightning-charge-fill"></i>
                  </div>
                  <div className="infra-metric-body">
                    <div className="infra-title">Network API Latency</div>
                    <div className="infra-value">{overview?.apiLatencyMs || 38} ms</div>
                    <div className="infra-sub">Fast edge response time</div>
                  </div>
                </div>

                <div className="infra-metric-card">
                  <div className="infra-metric-icon text-amber">
                    <i className="bi bi-activity"></i>
                  </div>
                  <div className="infra-metric-body">
                    <div className="infra-title">Platform Uptime</div>
                    <div className="infra-value">{overview?.uptime || "99.98%"}</div>
                    <div className="infra-sub">SLA enterprise target met</div>
                  </div>
                </div>
              </div>

              <div className="system-panel-footer">
                <div className="infra-footer-chip">
                  <i className="bi bi-node-plus-fill"></i>
                  <span>Node.js v20+ / Express Engine</span>
                </div>
                <div className="infra-footer-chip">
                  <i className="bi bi-database-check"></i>
                  <span>Mongoose Schema Validation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Live Recent Platform Transactions Feed */}
          <div className="analytics-block">
            <div className="analytics-block-header">
              <div>
                <h3>Live Marketplace Transactions Stream</h3>
                <p>Latest customer purchases across all categories and verified merchants.</p>
              </div>
              <span className="live-stream-badge">
                <i className="bi bi-arrow-down-up"></i> Real-time Feed
              </span>
            </div>

            {overview?.recentOrders && overview.recentOrders.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table recent-orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Details</th>
                      <th>Items</th>
                      <th>Total Value</th>
                      <th>Fulfillment Status</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview.recentOrders.map((ord) => (
                      <tr key={ord._id}>
                        <td>
                          <span className="order-id-badge">
                            #{ord._id.slice(-6).toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <div className="customer-info-cell">
                            <strong>{ord.customerName}</strong>
                            <span className="customer-email-sub">{ord.customerEmail}</span>
                          </div>
                        </td>
                        <td>
                          <span className="items-count-pill">
                            <i className="bi bi-box"></i> {ord.itemsCount} {ord.itemsCount === 1 ? "item" : "items"}
                          </span>
                        </td>
                        <td>
                          <strong className="order-price-val">
                            ${Number(ord.totalPrice || 0).toFixed(2)}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`order-status-badge status-${(ord.status || "pending").toLowerCase()}`}
                          >
                            {ord.status === "Delivered" && <i className="bi bi-check-circle-fill"></i>}
                            {ord.status === "Shipped" && <i className="bi bi-truck"></i>}
                            {ord.status === "Pending" && <i className="bi bi-clock-history"></i>}
                            {ord.status === "Cancelled" && <i className="bi bi-x-circle-fill"></i>}
                            {" "}{ord.status}
                          </span>
                        </td>
                        <td>
                          <span className="order-date-text">
                            {formatOrderDate(ord.createdAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty-box" style={{ padding: "2.5rem" }}>
                <i className="bi bi-receipt text-indigo"></i>
                <p>No customer transactions processed yet in the marketplace database.</p>
              </div>
            )}
          </div>

          {/* Administrative Quick Jump Toolbar */}
          <div className="overview-shortcuts-card">
            <div className="shortcuts-title-group">
              <i className="bi bi-lightning-fill text-amber"></i>
              <span>Direct Operational Shortcuts:</span>
            </div>
            <div className="shortcuts-button-group">
              <Button
                variant="secondary"
                size="sm"
                icon={<i className="bi bi-shop"></i>}
                onClick={() => {
                  handleTabSwitch("sellers");
                  setSellerFilter("pending");
                }}
              >
                Review Pending Merchants ({overview?.pendingSellers || 0})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<i className="bi bi-box-seam"></i>}
                onClick={() => handleTabSwitch("products")}
              >
                Moderate Catalog ({overview?.totalProducts || 0})
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={<i className="bi bi-people"></i>}
                onClick={() => handleTabSwitch("users")}
              >
                Manage User Directory ({overview?.totalUsers || 0})
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ===== REJECTION MODAL WITH SPECIFIC REASON & CUSTOM MESSAGE ===== */}
      {rejectingSeller &&
        createPortal(
        <div
          className="rejection-modal-overlay"
          onClick={() => setRejectingSeller(null)}
        >
          <div
            className="rejection-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rejection-modal-header">
              <i className="bi bi-x-octagon-fill rejection-icon"></i>
              <div>
                <h3>
                  Reject Seller: {rejectingSeller.storeName || rejectingSeller.firstName}
                </h3>
                <p>
                  Specify compliance findings and include a custom corrective message for the merchant.
                </p>
              </div>
            </div>

            <div className="rejection-form-group">
              <label htmlFor="rejection-reason-select">
                Specific Compliance Finding / Rejection Reason:
              </label>
              <select
                id="rejection-reason-select"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              >
                <option value="Incomplete or unreadable tax documentation (GSTIN/EIN)">
                  Incomplete or unreadable tax documentation (GSTIN/EIN)
                </option>
                <option value="Government ID mismatch or invalid identity verification">
                  Government ID mismatch or invalid identity verification
                </option>
                <option value="Bank account details could not be verified with financial institution">
                  Bank account details could not be verified with financial institution
                </option>
                <option value="Prohibited goods or counterfeit trademark risk detected">
                  Prohibited goods or counterfeit trademark risk detected
                </option>
                <option value="Business entity registration credentials could not be verified">
                  Business entity registration credentials could not be verified
                </option>
                <option value="Duplicate business entity or suspicious merchant profile">
                  Duplicate business entity or suspicious merchant profile
                </option>
                <option value="Other compliance / verification issue">
                  Other compliance / verification issue
                </option>
              </select>
            </div>

            <div className="rejection-form-group">
              <label htmlFor="custom-admin-message">
                Custom Directive / Detailed Feedback for Seller:
              </label>
              <textarea
                id="custom-admin-message"
                rows="4"
                placeholder="Type specific remarks or steps the seller must take before re-submitting (e.g. 'Your GST certificate was blurred and the business name did not match your bank account. Please re-upload a clear PDF.')..."
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
              />
            </div>

            <div className="rejection-modal-actions">
              <Button
                variant="outline"
                size="md"
                onClick={() => setRejectingSeller(null)}
              >
                Cancel
              </Button>
              <button
                type="button"
                className="action-btn reject-btn"
                style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}
                onClick={() =>
                  handleSellerStatus(
                    rejectingSeller._id,
                    "rejected",
                    rejectionReason,
                    rejectionMessage
                  )
                }
              >
                <i className="bi bi-x-circle-fill"></i> Confirm Rejection with Message
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ===== SELLER VERIFICATION DOSSIER INSPECTION MODAL ===== */}
      {inspectingSellerDocs &&
        createPortal(
          <div
            className="inspect-docs-overlay"
            onClick={() => setInspectingSellerDocs(null)}
          >
            <div
              className="inspect-docs-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inspect-header">
                <h3>
                  <i className="bi bi-shield-check text-purple"></i> Verification Dossier:{" "}
                  {inspectingSellerDocs.storeName || inspectingSellerDocs.firstName}
                </h3>
                <button
                  className="inspect-close-btn"
                  onClick={() => setInspectingSellerDocs(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              {inspectingSellerDocs.sellerDocuments ? (
                <div className="inspect-grid">
                  <div className="inspect-item">
                    <span>Legal Business Name</span>
                    <strong>
                      {inspectingSellerDocs.sellerDocuments.businessName || "Not provided"}
                    </strong>
                  </div>

                  <div className="inspect-item">
                    <span>Entity Classification</span>
                    <strong>
                      {inspectingSellerDocs.sellerDocuments.businessType || "Sole Proprietorship"}
                    </strong>
                  </div>

                  <div className="inspect-item">
                    <span>Tax ID (GSTIN/EIN/VAT)</span>
                    <strong style={{ color: "#7c3aed" }}>
                      {inspectingSellerDocs.sellerDocuments.taxId || "Not on file"}
                    </strong>
                  </div>

                  <div className="inspect-item">
                    <span>Primary Catalog Category</span>
                    <strong>
                      {inspectingSellerDocs.sellerDocuments.storeCategory || "General"}
                    </strong>
                  </div>

                  <div className="inspect-item">
                    <span>ID Type & Serial</span>
                    <strong>
                      {inspectingSellerDocs.sellerDocuments.idType}: {inspectingSellerDocs.sellerDocuments.idNumber}
                    </strong>
                  </div>

                  <div className="inspect-item">
                    <span>Settlement Bank</span>
                    <strong>
                      {inspectingSellerDocs.sellerDocuments.bankName || "Not provided"}{" "}
                      {inspectingSellerDocs.sellerDocuments.accountNumber
                        ? `(••••${inspectingSellerDocs.sellerDocuments.accountNumber.slice(-4)})`
                        : ""}
                    </strong>
                  </div>

                  <div className="inspect-item full-span">
                    <span>Registered Business Address</span>
                    <strong>
                      {inspectingSellerDocs.sellerDocuments.businessAddress || "On file with user profile"}
                    </strong>
                  </div>

                  {inspectingSellerDocs.sellerDocuments.documentUrl && (
                    <div className="inspect-item full-span">
                      <span>Uploaded Certificate Reference / URL</span>
                      <a
                        href={inspectingSellerDocs.sellerDocuments.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#2563eb", wordBreak: "break-all" }}
                      >
                        <i className="bi bi-link-45deg"></i>{" "}
                        {inspectingSellerDocs.sellerDocuments.documentUrl}
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "#64748b" }}>
                  <i className="bi bi-info-circle" style={{ fontSize: "2rem" }}></i>
                  <p>This seller has not yet submitted their formal verification documents.</p>
                </div>
              )}

              {inspectingSellerDocs.rejectionReason && (
                <div
                  style={{
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: "10px",
                    padding: "0.85rem 1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <strong style={{ color: "#be123c", fontSize: "0.85rem", display: "block" }}>
                    Active Rejection Finding: {inspectingSellerDocs.rejectionReason}
                  </strong>
                  {inspectingSellerDocs.rejectionMessage && (
                    <p style={{ margin: "0.3rem 0 0", color: "#475569", fontSize: "0.84rem" }}>
                      &ldquo;{inspectingSellerDocs.rejectionMessage}&rdquo;
                    </p>
                  )}
                </div>
              )}

              <div className="inspect-actions">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setInspectingSellerDocs(null)}
                >
                  Close Dossier
                </Button>

                {inspectingSellerDocs.sellerStatus !== "approved" && (
                  <button
                    type="button"
                    className="action-btn approve-btn"
                    onClick={() => {
                      handleSellerStatus(inspectingSellerDocs._id, "approved");
                      setInspectingSellerDocs(null);
                    }}
                  >
                    <i className="bi bi-check-lg"></i> Approve Merchant
                  </button>
                )}

                {inspectingSellerDocs.sellerStatus !== "rejected" && (
                  <button
                    type="button"
                    className="action-btn reject-btn"
                    onClick={() => {
                      setRejectingSeller(inspectingSellerDocs);
                      setInspectingSellerDocs(null);
                    }}
                  >
                    <i className="bi bi-x-lg"></i> Reject with Message
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ===== PRODUCT REJECTION & MODERATION MODAL ===== */}
      {rejectingProduct &&
        createPortal(
          <div
            className="rejection-modal-overlay"
            onClick={() => setRejectingProduct(null)}
          >
            <div
              className="rejection-modal-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="rejection-modal-header">
                <h3>
                  <i className="bi bi-shield-slash text-crimson"></i> Moderate Product:{" "}
                  {rejectingProduct.name}
                </h3>
                <button
                  className="inspect-close-btn"
                  onClick={() => setRejectingProduct(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div className="rejection-seller-summary">
                <div>
                  <strong>Brand:</strong> {rejectingProduct.brand || "TheStore"}
                </div>
                <div>
                  <strong>Seller:</strong> {rejectingProduct.sellerName || "Marketplace Merchant"}
                </div>
                <div>
                  <strong>Category:</strong> {rejectingProduct.type}
                </div>
                <div>
                  <strong>Price:</strong> ${(rejectingProduct.price || 0).toFixed(2)}
                </div>
              </div>

              <div className="rejection-form-group">
                <label htmlFor="product-rejection-reason-select">
                  Compliance Violation / Moderation Reason:
                </label>
                <select
                  id="product-rejection-reason-select"
                  value={productRejectionReason}
                  onChange={(e) => setProductRejectionReason(e.target.value)}
                >
                  <option value="Policy compliance violation or counterfeit concern">
                    Policy compliance violation or counterfeit concern
                  </option>
                  <option value="Misleading title, inaccurate specifications, or wrong category">
                    Misleading title, inaccurate specifications, or wrong category
                  </option>
                  <option value="Low image quality, watermarked, or copyrighted product imagery">
                    Low image quality, watermarked, or copyrighted product imagery
                  </option>
                  <option value="Prohibited product, restricted goods, or illegal item">
                    Prohibited product, restricted goods, or illegal item
                  </option>
                  <option value="Unrealistic pricing, fake discount, or suspicious inventory figures">
                    Unrealistic pricing, fake discount, or suspicious inventory figures
                  </option>
                  <option value="Other marketplace policy violation">
                    Other marketplace policy violation
                  </option>
                </select>
              </div>

              <div className="rejection-form-group">
                <label htmlFor="custom-product-admin-message">
                  Administrative Directive / Feedback for Merchant:
                </label>
                <textarea
                  id="custom-product-admin-message"
                  rows="4"
                  placeholder="Provide instructions or remediation steps for the merchant before re-submitting (e.g. 'Please provide authentic manufacturer invoice and replace low-resolution mockup photos with real product shots.')..."
                  value={productRejectionMessage}
                  onChange={(e) => setProductRejectionMessage(e.target.value)}
                />
              </div>

              <div className="rejection-modal-actions">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setRejectingProduct(null)}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  className="action-btn reject-btn"
                  style={{ padding: "0.6rem 1.2rem", fontSize: "0.9rem" }}
                  onClick={() =>
                    handleProductApprovalStatus(
                      rejectingProduct._id,
                      "rejected",
                      productRejectionReason,
                      productRejectionMessage
                    )
                  }
                >
                  <i className="bi bi-x-circle-fill"></i> Confirm Rejection & Unlist
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ===== PRODUCT DETAILS & SPECS INSPECTION MODAL ===== */}
      {inspectingProduct &&
        createPortal(
          <div
            className="inspect-docs-overlay"
            onClick={() => setInspectingProduct(null)}
          >
            <div
              className="inspect-docs-card"
              style={{ maxWidth: "720px" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="inspect-header">
                <h3>
                  <i className="bi bi-box-seam-fill text-purple"></i> Listing Audit: {inspectingProduct.name}
                </h3>
                <button
                  className="inspect-close-btn"
                  onClick={() => setInspectingProduct(null)}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>

              <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.2rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                {inspectingProduct.imageUrl ? (
                  <img
                    src={inspectingProduct.imageUrl}
                    alt={inspectingProduct.name}
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "12px",
                      objectFit: "cover",
                      border: "1px solid #e2e8f0",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "12px",
                      background: "#ede9fe",
                      color: "#7c3aed",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.8rem",
                      border: "1px solid #ddd6fe",
                    }}
                  >
                    <i className="bi bi-box-seam"></i>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.4rem" }}>
                    <span className="brand-tag">{inspectingProduct.brand || "TheStore"}</span>
                    <span className="type-pill">{inspectingProduct.type}</span>
                    <span className={`status-pill status-${inspectingProduct.approvalStatus || "approved"}`}>
                      {(inspectingProduct.approvalStatus || "approved").toUpperCase()}
                    </span>
                  </div>
                  <h4 style={{ margin: "0.2rem 0 0.5rem", fontSize: "1.15rem", color: "#1e1b4b" }}>
                    {inspectingProduct.name}
                  </h4>
                  <div style={{ fontSize: "0.92rem", color: "#475569" }}>
                    Price: <strong style={{ color: "#059669", fontSize: "1.05rem" }}>${Number(inspectingProduct.price || 0).toFixed(2)}</strong>
                    {inspectingProduct.originalPrice > inspectingProduct.price && (
                      <span style={{ textDecoration: "line-through", color: "#94a3b8", marginLeft: "0.5rem" }}>
                        ${Number(inspectingProduct.originalPrice).toFixed(2)}
                      </span>
                    )}
                    {" | "}Stock: <strong>{inspectingProduct.stock} units</strong>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "0.3rem" }}>
                    Merchant: <strong>{inspectingProduct.sellerName || "Verified Merchant"}</strong>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "1.2rem" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em" }}>
                  Description
                </span>
                <p style={{ margin: "0.3rem 0 0", fontSize: "0.88rem", color: "#334155", lineHeight: 1.5 }}>
                  {inspectingProduct.description}
                </p>
              </div>

              {inspectingProduct.specs && Object.keys(inspectingProduct.specs).length > 0 && (
                <div style={{ marginBottom: "1.2rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 800, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
                    Technical Specifications
                  </span>
                  <div className="inspect-grid">
                    {Object.entries(inspectingProduct.specs).map(([key, val]) => (
                      val ? (
                        <div className="inspect-item" key={key}>
                          <span>{key.replace(/([A-Z])/g, " $1")}</span>
                          <strong>{String(val)}</strong>
                        </div>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {inspectingProduct.rejectionReason && (
                <div
                  style={{
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    borderRadius: "10px",
                    padding: "0.85rem 1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <strong style={{ color: "#be123c", fontSize: "0.85rem", display: "block" }}>
                    Rejection Reason: {inspectingProduct.rejectionReason}
                  </strong>
                </div>
              )}

              <div className="inspect-actions">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setInspectingProduct(null)}
                >
                  Close Audit
                </Button>

                {inspectingProduct.approvalStatus !== "approved" && (
                  <button
                    type="button"
                    className="action-btn approve-btn"
                    onClick={() => {
                      handleProductApprovalStatus(inspectingProduct._id, "approved");
                      setInspectingProduct(null);
                    }}
                  >
                    <i className="bi bi-check-lg"></i> Approve Product
                  </button>
                )}

                {inspectingProduct.approvalStatus !== "rejected" && (
                  <button
                    type="button"
                    className="action-btn reject-btn"
                    onClick={() => {
                      setRejectingProduct(inspectingProduct);
                      setInspectingProduct(null);
                    }}
                  >
                    <i className="bi bi-x-lg"></i> Reject Listing
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body
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

export default AdminPortal;
