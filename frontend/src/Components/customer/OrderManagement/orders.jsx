import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";

import {
  fetchOrders,
  cancelOrder,
  clearOrderMessage,
} from "../../../store/slices/ordersSlice";

import { addToCart } from "../../../store/slices/cartSlice";
import MessageModal from "../../common/ui/messagemodel/messageModel";
import Button from "../../common/ui/buttons/button";
import GoodLoader from "../../common/ui/loader/loader";
import { getProductImage } from "../../../utils/productImages";
import "./orders.css";

const STATUS_TABS = ["All", "Pending", "Shipped", "Delivered", "Cancelled"];

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, loading, error, message, messageType } = useSelector(
    (state) => state.orders
  );

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const cartLoading = useSelector((state) => state.cart.loading);

  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [reorderingId, setReorderingId] = useState(null);
  const [cancelConfirmId, setCancelConfirmId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    dispatch(fetchOrders());
  }, [dispatch, isLoggedIn, navigate]);

  const toggleOrderItems = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleCopyId = (e, orderId) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCloseModal = () => {
    dispatch(clearOrderMessage());
  };

  const handleOpenAssistantForOrder = (orderId) => {
    window.dispatchEvent(new CustomEvent("open-chatbot"));
  };

  const handleReorder = async (e, order) => {
    e.stopPropagation();
    if (!order?.items?.length) return;

    setReorderingId(order._id);
    try {
      for (const item of order.items) {
        const pId = item.productId?._id || item.productId;
        if (pId) {
          await dispatch(
            addToCart({ productId: pId, quantity: item.quantity || 1 })
          ).unwrap();
        }
      }
      navigate("/cart");
    } catch {
      // Handled by Redux
    } finally {
      setReorderingId(null);
    }
  };

  const handleConfirmCancel = (orderId) => {
    dispatch(cancelOrder(orderId));
    setCancelConfirmId(null);
  };

  /* ===== FILTER & SEARCH ORDERS ===== */
  const filteredOrders = useMemo(() => {
    let list = [...items];

    // Status Tab Filter
    if (activeTab !== "All") {
      list = list.filter(
        (o) => (o.status || "Pending").toLowerCase() === activeTab.toLowerCase()
      );
    }

    // Search query filter (Order ID or Item Name)
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((o) => {
        const matchesId = (o._id || "").toLowerCase().includes(q);
        const matchesItems = o.items?.some((i) =>
          (i.productId?.name || "").toLowerCase().includes(q)
        );
        return matchesId || matchesItems;
      });
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return list;
  }, [items, activeTab, searchQuery]);

  /* ===== ORDER COUNTS BY STATUS ===== */
  const counts = useMemo(() => {
    const c = { All: items.length, Pending: 0, Shipped: 0, Delivered: 0, Cancelled: 0 };
    items.forEach((o) => {
      const s = o.status || "Pending";
      if (c[s] !== undefined) c[s] += 1;
    });
    return c;
  }, [items]);

  /* ================= LOADING STATE ================= */
  if (loading && !items.length) {
    return (
      <div className="order-management">
        <GoodLoader message="Retrieving your orders & delivery tracking..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-management">
        <div className="orders-error-card">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <h3>Unable to Load Orders</h3>
          <p>{error}</p>
          <Button variant="primary" onClick={() => dispatch(fetchOrders())}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management">
      {/* ================= HERO HEADER ================= */}
      <section className="orders-hero-header">
        <div className="orders-hero-left">
          <span className="orders-hero-pill">
            <i className="bi bi-shield-check"></i> Verified Purchases
          </span>
          <h1>My Orders & Tracking</h1>
          <p className="orders-subtitle">
            Track live package shipments, download invoice breakdowns, and easily reorder your favorites.
          </p>
        </div>

        <div className="orders-hero-metrics">
          <div className="metric-box">
            <span className="metric-val">{items.length}</span>
            <span className="metric-lbl">Total Placed</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-box">
            <span className="metric-val text-emerald">{counts.Delivered}</span>
            <span className="metric-lbl">Delivered</span>
          </div>
          <div className="metric-divider"></div>
          <div className="metric-box">
            <span className="metric-val text-amber">{counts.Pending + counts.Shipped}</span>
            <span className="metric-lbl">In Progress</span>
          </div>
        </div>
      </section>

      {/* ================= CONTROLS: STATUS TABS & SEARCH ================= */}
      <div className="orders-controls-bar">
        {/* Status Tabs */}
        <div className="orders-status-tabs">
          {STATUS_TABS.map((tab) => {
            const count = counts[tab] || 0;
            return (
              <button
                key={tab}
                className={`order-tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "All" && <i className="bi bi-collection"></i>}
                {tab === "Pending" && <i className="bi bi-clock-history"></i>}
                {tab === "Shipped" && <i className="bi bi-truck"></i>}
                {tab === "Delivered" && <i className="bi bi-check-circle-fill"></i>}
                {tab === "Cancelled" && <i className="bi bi-x-circle-fill"></i>}
                <span>{tab}</span>
                <span className="order-tab-count">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Live Search */}
        <div className="orders-search-wrap">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by Order ID or item name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="orders-search-input"
          />
          {searchQuery && (
            <button
              className="orders-clear-search"
              onClick={() => setSearchQuery("")}
              title="Clear search"
            >
              <i className="bi bi-x"></i>
            </button>
          )}
        </div>
      </div>

      {/* ================= ORDER LIST ================= */}
      {filteredOrders.length ? (
        <ul className="order-list">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order._id;
            const statusClass = (order.status || "Pending").toLowerCase();
            const itemCount = order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;
            const isReordering = reorderingId === order._id;

            return (
              <li key={order._id} className="order-item">
                {/* TOP BAR: Order ID & Status */}
                <div className="order-top-bar">
                  <div className="order-id-group">
                    <span className="order-id-label">ORDER #</span>
                    <strong className="order-id-val">{order._id}</strong>
                    <button
                      className="copy-id-btn"
                      onClick={(e) => handleCopyId(e, order._id)}
                      title="Copy Order ID"
                      aria-label="Copy Order ID"
                    >
                      <i className={`bi ${copiedId === order._id ? "bi-check2" : "bi-clipboard"}`}></i>
                      {copiedId === order._id && <span className="copied-tooltip">Copied!</span>}
                    </button>
                  </div>

                  <div className="order-status-badge-wrap">
                    <span className={`order-status-pill status-${statusClass}`}>
                      <i
                        className={`bi ${
                          statusClass === "delivered"
                            ? "bi-check-circle-fill"
                            : statusClass === "cancelled"
                            ? "bi-x-circle-fill"
                            : statusClass === "shipped"
                            ? "bi-truck"
                            : "bi-clock-fill"
                        }`}
                      ></i>
                      {order.status || "Pending"}
                    </span>
                  </div>
                </div>

                {/* TRACKING PROGRESS STEPPER */}
                <div className="order-stepper-wrap">
                  {statusClass === "cancelled" ? (
                    <div className="cancelled-notice-bar">
                      <i className="bi bi-info-circle-fill"></i>
                      <span>This order was cancelled. Any authorized charges were released back to your payment method.</span>
                    </div>
                  ) : (
                    <div className="order-stepper">
                      <div className={`step-node ${["pending", "shipped", "delivered"].includes(statusClass) ? "completed" : ""}`}>
                        <div className="step-circle"><i className="bi bi-check2"></i></div>
                        <span className="step-label">Order Placed</span>
                      </div>
                      <div className={`step-line ${["shipped", "delivered"].includes(statusClass) ? "completed" : ""}`}></div>
                      <div className={`step-node ${["shipped", "delivered"].includes(statusClass) ? "completed" : ""}`}>
                        <div className="step-circle"><i className="bi bi-box-seam"></i></div>
                        <span className="step-label">Processing</span>
                      </div>
                      <div className={`step-line ${statusClass === "delivered" ? "completed" : ""}`}></div>
                      <div className={`step-node ${["shipped", "delivered"].includes(statusClass) ? "completed" : ""}`}>
                        <div className="step-circle"><i className="bi bi-truck"></i></div>
                        <span className="step-label">Shipped</span>
                      </div>
                      <div className={`step-line ${statusClass === "delivered" ? "completed" : ""}`}></div>
                      <div className={`step-node ${statusClass === "delivered" ? "completed" : ""}`}>
                        <div className="step-circle"><i className="bi bi-house-door-fill"></i></div>
                        <span className="step-label">Delivered</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* SUMMARY ROW: Thumbnails, Meta info, Actions */}
                <div className="order-summary-row">
                  {/* Thumbnails preview */}
                  <div className="order-thumbs-preview">
                    {order.items?.slice(0, 4).map((item, idx) => {
                      const img = getProductImage(item.productId);
                      return (
                        <div key={item.productId?._id || idx} className="order-preview-thumb" title={item.productId?.name}>
                          <img
                            src={img}
                            alt={item.productId?.name || "Item"}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/not-found.svg";
                            }}
                          />
                          {item.quantity > 1 && (
                            <span className="thumb-qty-pill">&times;{item.quantity}</span>
                          )}
                        </div>
                      );
                    })}
                    {order.items?.length > 4 && (
                      <div className="order-thumbs-more">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>

                  <div className="order-meta-info">
                    <div className="meta-block">
                      <span className="meta-label">Date Placed</span>
                      <strong className="meta-value">
                        {new Date(order.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </strong>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">Total Items</span>
                      <strong className="meta-value">
                        {itemCount} {itemCount === 1 ? "item" : "items"}
                      </strong>
                    </div>

                    <div className="meta-block">
                      <span className="meta-label">Total Amount</span>
                      <strong className="meta-value total-highlight">
                        ${order.totalPrice?.toFixed(2)}
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="order-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<i className={`bi ${isExpanded ? "bi-chevron-up" : "bi-chevron-down"}`}></i>}
                      onClick={() => toggleOrderItems(order._id)}
                    >
                      {isExpanded ? "Hide Details" : "View Details"}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<i className="bi bi-arrow-repeat"></i>}
                      loading={isReordering}
                      disabled={cartLoading || isReordering}
                      onClick={(e) => handleReorder(e, order)}
                      title="Add all items from this order to your cart"
                    >
                      Buy Again
                    </Button>

                    <button
                      type="button"
                      className="order-help-btn"
                      onClick={() => handleOpenAssistantForOrder(order._id)}
                      title="Need assistance with this order?"
                    >
                      <i className="bi bi-question-circle"></i>
                    </button>

                    {order.status !== "Cancelled" && (
                      <button
                        type="button"
                        className="cancel-order-button"
                        disabled={loading}
                        onClick={() => setCancelConfirmId(order._id)}
                        title="Cancel this order"
                      >
                        <i className="bi bi-x-circle"></i> Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* EXPANDED ITEM DETAILS DRAWER */}
                {isExpanded && (
                  <div className="order-items-drawer">
                    <div className="drawer-header-row">
                      <h3>
                        <i className="bi bi-box2-heart"></i> Itemized Package Contents
                      </h3>
                      <button
                        className="print-invoice-btn"
                        onClick={() => window.print()}
                        title="Print order summary"
                      >
                        <i className="bi bi-printer"></i> Print Receipt
                      </button>
                    </div>

                    <ul className="order-items">
                      {order.items.map((item, idx) => {
                        const img = getProductImage(item.productId);
                        const unitPrice = item.price ?? item.productId?.price ?? 0;
                        const lineTotal = unitPrice * item.quantity;

                        return (
                          <li
                            key={item.productId?._id || item._id || idx}
                            className="order-item-detail"
                          >
                            <div className="order-item-thumb-box">
                              <img
                                src={img}
                                alt={item.productId?.name || "Product"}
                                className="order-item-thumb-img"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/not-found.svg";
                                }}
                              />
                            </div>

                            <div className="order-item-info">
                              <h4>{item.productId?.name || "Store Item"}</h4>
                              <p className="order-item-sub">
                                Unit Price: <strong>${unitPrice.toFixed(2)}</strong>
                              </p>
                            </div>

                            <div className="order-item-qty">
                              <span>Qty: <strong>{item.quantity}</strong></span>
                            </div>

                            <div className="order-item-total">
                              ${lineTotal.toFixed(2)}
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Cost Breakdown & Payment Summary */}
                    <div className="order-breakdown-card">
                      <div className="breakdown-col">
                        <h4>Payment & Fulfillment</h4>
                        <p className="breakdown-text">
                          <i className="bi bi-credit-card-2-front"></i> Paid via{" "}
                          <strong>{order.paymentMethod || "Credit / Debit Card"}</strong>
                        </p>
                        {order.couponApplied && (
                          <p className="breakdown-text" style={{ color: "#059669", fontWeight: 600 }}>
                            <i className="bi bi-tag-fill"></i> Coupon &quot;{order.couponApplied}&quot; applied (-${Number(order.discountAmount || 0).toFixed(2)})
                          </p>
                        )}
                        <p className="breakdown-text">
                          <i className="bi bi-truck"></i> Standard Express Delivery (Delivered to account address)
                        </p>
                      </div>

                      <div className="breakdown-col cost-summary">
                        {order.discountAmount > 0 && (
                          <div className="cost-row" style={{ color: "#059669" }}>
                            <span>Promo Discount:</span>
                            <strong>-${Number(order.discountAmount).toFixed(2)}</strong>
                          </div>
                        )}
                        <div className="cost-row">
                          <span>Delivery:</span>
                          <strong className="text-emerald">FREE</strong>
                        </div>
                        <div className="cost-row total-final">
                          <span>Grand Total:</span>
                          <strong>${order.totalPrice?.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="empty-orders-view">
          <div className="empty-orders-icon">
            <i className="bi bi-receipt-cutoff"></i>
          </div>
          <h2>No matching orders found</h2>
          <p>
            {searchQuery || activeTab !== "All"
              ? "No orders match the selected filters. Try clearing your search."
              : "When you complete a purchase, your orders, live tracking, and invoices will appear here."}
          </p>
          <div className="empty-actions">
            {searchQuery || activeTab !== "All" ? (
              <Button
                variant="outline"
                onClick={() => {
                  setActiveTab("All");
                  setSearchQuery("");
                }}
              >
                Clear All Filters
              </Button>
            ) : (
              <Link to="/" className="btn btn-primary btn-md">
                <i className="bi bi-bag"></i> Start Shopping
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ================= CANCEL CONFIRMATION MODAL ================= */}
      {cancelConfirmId && (
        <div className="cancel-modal-overlay">
          <div className="cancel-modal-card">
            <div className="cancel-modal-icon">
              <i className="bi bi-exclamation-circle-fill"></i>
            </div>
            <h3>Cancel This Order?</h3>
            <p>
              Are you sure you want to cancel order <strong>#{cancelConfirmId}</strong>? This action cannot be undone.
            </p>
            <div className="cancel-modal-actions">
              <Button variant="outline" onClick={() => setCancelConfirmId(null)}>
                Keep Order
              </Button>
              <Button variant="danger" onClick={() => handleConfirmCancel(cancelConfirmId)}>
                Yes, Cancel Order
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MESSAGE MODAL ================= */}
      {messageType && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default OrderManagement;
