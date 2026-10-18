import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  placeOrder,
  clearCartMessage,
} from "../../../store/slices/cartSlice";

import MessageModal from "../../common/ui/messagemodel/messageModel";
import Button from "../../common/ui/buttons/button";
import GoodLoader from "../../common/ui/loader/loader";
import { getProductImage } from "../../../utils/productImages";

import "./cart.css";

/* Available Promotional Coupons */
const AVAILABLE_COUPONS = [
  {
    code: "STORE10",
    description: "10% off on all items",
    type: "percent",
    value: 10,
    minOrder: 0,
    badge: "Popular",
  },
  {
    code: "SAVE20",
    description: "$20 off on orders over $50",
    type: "fixed",
    value: 20,
    minOrder: 50,
    badge: "Best Value",
  },
  {
    code: "WELCOME15",
    description: "15% off customer discount",
    type: "percent",
    value: 15,
    minOrder: 30,
    badge: "Special",
  },
  {
    code: "SUPER50",
    description: "$50 off on orders over $150",
    type: "fixed",
    value: 50,
    minOrder: 150,
    badge: "Mega Saver",
  },
];

/* Available Payment Gateways */
const PAYMENT_METHODS = [
  {
    id: "credit_card",
    name: "Credit / Debit Card",
    icon: "bi-credit-card-2-front-fill",
    badge: "Encrypted & Fast",
    desc: "Visa, MasterCard, RuPay, & Amex with 256-bit SSL protection",
  },
  {
    id: "upi",
    name: "UPI / Instant Pay",
    icon: "bi-lightning-charge-fill",
    badge: "0% Fee",
    desc: "Google Pay, PhonePe, Paytm, or any UPI ID / QR code",
  },
  {
    id: "net_banking",
    name: "Net Banking",
    icon: "bi-bank2",
    badge: "50+ Banks",
    desc: "Direct secure bank transfer via your personal banking portal",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    icon: "bi-cash-coin",
    badge: "Pay at Doorstep",
    desc: "Pay in cash or digital scan upon parcel arrival at your door",
  },
];

const POPULAR_BANKS = ["HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Citi Bank", "Chase"];

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, loading, error, message, messageType } = useSelector(
    (state) => state.cart
  );
  const user = useSelector((state) => state.auth.user);

  /* Coupon State */
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  /* Payment Method State */
  const [selectedPayment, setSelectedPayment] = useState("credit_card");
  const [cardData, setCardData] = useState({
    number: "4532 •••• •••• 8921",
    name: (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "John Doe").trim(),
    expiry: "12/28",
    cvv: "892",
  });
  const [upiId, setUpiId] = useState(user?.email ? `${user.username || "customer"}@upi` : "customer@okaxis");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const validItems = items.filter((i) => i && i.productId);
  const subtotal = validItems.reduce(
    (sum, i) => sum + (i.productId.price || 0) * i.quantity,
    0
  );
  const shipping = 0; // Free shipping

  /* Calculate Discount */
  let discountAmount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === "percent") {
      discountAmount = (subtotal * appliedCoupon.value) / 100;
    } else if (appliedCoupon.type === "fixed") {
      discountAmount = Math.min(appliedCoupon.value, subtotal);
    }
  }

  const finalTotalNumber = Math.max(0, subtotal + shipping - discountAmount);
  const finalTotalPrice = finalTotalNumber.toFixed(2);

  /* Handle Coupon Apply */
  const handleApplyCoupon = (codeCandidate) => {
    const code = (codeCandidate || couponInput).trim().toUpperCase();
    setCouponError("");
    setCouponSuccess("");

    if (!code) {
      setCouponError("Please enter a promo code");
      return;
    }

    const coupon = AVAILABLE_COUPONS.find((c) => c.code === code);
    if (!coupon) {
      setCouponError(`Coupon "${code}" is invalid. Try STORE10, SAVE20 or WELCOME15.`);
      return;
    }

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      setCouponError(
        `Coupon "${code}" requires a minimum order of $${coupon.minOrder.toFixed(2)} (your subtotal: $${subtotal.toFixed(2)})`
      );
      return;
    }

    setAppliedCoupon(coupon);
    setCouponInput("");
    setCouponSuccess(
      `Coupon "${coupon.code}" applied! You save ${
        coupon.type === "percent" ? `${coupon.value}%` : `$${coupon.value}`
      } on this order.`
    );
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponSuccess("");
  };

  /* Handle Checkout Submission */
  const handlePlaceOrder = () => {
    const activeMethodObj =
      PAYMENT_METHODS.find((p) => p.id === selectedPayment) || PAYMENT_METHODS[0];

    dispatch(
      placeOrder({
        paymentMethod: activeMethodObj.name,
        couponApplied: appliedCoupon?.code || null,
        discountAmount,
        totalPrice: finalTotalNumber,
      })
    );
  };

  if (loading && !items.length) {
    return (
      <div className="cart-page">
        <GoodLoader message="Retrieving your shopping bag..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-error-card">
          <i className="bi bi-exclamation-circle-fill"></i>
          <p>{error}</p>
          <Button variant="primary" onClick={() => dispatch(fetchCart())}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <div>
          <h1>Shopping Cart</h1>
          <p className="cart-header-sub">
            Review your items, apply promo vouchers, and select your preferred payment method
          </p>
        </div>
        <span className="cart-item-count">
          {validItems.length} {validItems.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      {validItems.length ? (
        <div className="cart-content-grid">
          {/* Main Column: Items List & Payment Method Selector */}
          <div className="cart-items-wrapper">
            <ul className="cart-items-list">
              {validItems.map((item) => {
                const itemTotal = ((item.productId.price || 0) * item.quantity).toFixed(2);

                return (
                  <li key={item.productId._id} className="cart-item">
                    {/* Item Thumbnail */}
                    <div className="cart-item-thumbnail">
                      <img
                        src={getProductImage(item.productId)}
                        alt={item.productId.name}
                        className="cart-thumb-img"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fb = e.target.parentElement.querySelector(".cart-thumb-fallback");
                          if (fb) fb.style.display = "flex";
                        }}
                      />
                      <div className="cart-thumb-fallback" style={{ display: "none" }}>
                        <i className="bi bi-box-seam"></i>
                      </div>
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <span className="cart-item-type">{item.productId.type}</span>
                        <h2>{item.productId.name}</h2>
                        <p className="cart-item-unit-price">
                          ${(item.productId.price || 0).toFixed(2)} each
                        </p>
                      </div>

                      {/* Quantity & Action Controls */}
                      <div className="cart-item-actions">
                        <div className="quantity-controls">
                          <button
                            type="button"
                            disabled={loading || item.quantity <= 1}
                            onClick={() =>
                              dispatch(
                                updateCartItem({
                                  productId: item.productId._id,
                                  quantity: item.quantity - 1,
                                })
                              )
                            }
                            aria-label="Decrease quantity"
                          >
                            <i className="bi bi-dash"></i>
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            disabled={loading || item.quantity >= (item.productId.stock || 999)}
                            onClick={() =>
                              dispatch(
                                updateCartItem({
                                  productId: item.productId._id,
                                  quantity: item.quantity + 1,
                                })
                              )
                            }
                            aria-label="Increase quantity"
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>

                        <div className="item-price-col">
                          <span className="item-total-price">${itemTotal}</span>
                        </div>

                        <button
                          type="button"
                          className="cart-remove-btn"
                          disabled={loading}
                          onClick={() => dispatch(removeFromCart(item.productId._id))}
                          title="Remove item"
                          aria-label="Remove item"
                        >
                          <i className="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* ================= PAYMENT METHOD SELECTION CARD ================= */}
            <div className="cart-checkout-section payment-methods-card">
              <div className="section-title-wrap">
                <div className="section-title-icon">
                  <i className="bi bi-credit-card-2-front"></i>
                </div>
                <div>
                  <h3 className="section-title">Select Payment Method</h3>
                  <p className="section-subtitle">
                    Choose how you would like to pay. All transactions are securely encrypted.
                  </p>
                </div>
              </div>

              <div className="payment-options-grid">
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = selectedPayment === pm.id;
                  return (
                    <div
                      key={pm.id}
                      className={`payment-option-card ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedPayment(pm.id)}
                    >
                      <div className="payment-radio-indicator">
                        <div className="payment-radio-circle">
                          {isSelected && <div className="payment-radio-dot" />}
                        </div>
                      </div>

                      <div className="payment-option-icon">
                        <i className={`bi ${pm.icon}`}></i>
                      </div>

                      <div className="payment-option-body">
                        <div className="payment-title-row">
                          <strong className="payment-name">{pm.name}</strong>
                          <span className="payment-badge">{pm.badge}</span>
                        </div>
                        <p className="payment-desc">{pm.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Payment Details Accordion */}
              <div className="payment-details-panel">
                {selectedPayment === "credit_card" && (
                  <div className="card-input-mockup">
                    <div className="card-mockup-header">
                      <span><i className="bi bi-shield-lock-fill"></i> 256-bit SSL Secure Card Payment</span>
                      <div className="card-brand-chips">
                        <span className="chip-visa">VISA</span>
                        <span className="chip-mc">MasterCard</span>
                        <span className="chip-amex">AMEX</span>
                      </div>
                    </div>

                    <div className="mockup-fields-grid">
                      <div className="mockup-field">
                        <label>CARD NUMBER</label>
                        <div className="mockup-input-wrap">
                          <i className="bi bi-credit-card"></i>
                          <input
                            type="text"
                            value={cardData.number}
                            onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                            placeholder="4532 •••• •••• 8821"
                          />
                        </div>
                      </div>

                      <div className="mockup-field">
                        <label>CARDHOLDER NAME</label>
                        <div className="mockup-input-wrap">
                          <i className="bi bi-person"></i>
                          <input
                            type="text"
                            value={cardData.name}
                            onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                            placeholder="Full name as on card"
                          />
                        </div>
                      </div>

                      <div className="mockup-row-dual">
                        <div className="mockup-field">
                          <label>EXPIRY</label>
                          <input
                            type="text"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                            placeholder="MM/YY"
                          />
                        </div>
                        <div className="mockup-field">
                          <label>CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            value={cardData.cvv}
                            onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPayment === "upi" && (
                  <div className="upi-input-mockup">
                    <div className="upi-apps-row">
                      <span className="upi-app-badge active"><i className="bi bi-google"></i> Google Pay</span>
                      <span className="upi-app-badge"><i className="bi bi-phone"></i> PhonePe</span>
                      <span className="upi-app-badge"><i className="bi bi-wallet2"></i> Paytm</span>
                      <span className="upi-app-badge"><i className="bi bi-qr-code-scan"></i> Scan QR</span>
                    </div>
                    <div className="mockup-field">
                      <label>ENTER UPI ID (VPA)</label>
                      <div className="mockup-input-wrap">
                        <i className="bi bi-at"></i>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. mobileNumber@upi or name@okaxis"
                        />
                        <span className="upi-verified-tag">
                          <i className="bi bi-check-circle-fill"></i> Verified
                        </span>
                      </div>
                      <small className="field-hint">A payment approval request will be dispatched to your UPI app.</small>
                    </div>
                  </div>
                )}

                {selectedPayment === "net_banking" && (
                  <div className="banking-input-mockup">
                    <label className="banking-label">CHOOSE YOUR BANK</label>
                    <div className="popular-banks-grid">
                      {POPULAR_BANKS.map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          className={`bank-pill ${selectedBank === bank ? "active" : ""}`}
                          onClick={() => setSelectedBank(bank)}
                        >
                          <i className="bi bi-bank"></i>
                          <span>{bank}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPayment === "cod" && (
                  <div className="cod-info-box">
                    <i className="bi bi-info-circle-fill"></i>
                    <div>
                      <strong>No Upfront Online Payment Required</strong>
                      <p>
                        Keep cash or digital UPI ready when our logistics partner delivers this order to your address.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="cart-continue-link">
              <Link to="/">
                <i className="bi bi-arrow-left"></i> Continue Shopping
              </Link>
            </div>
          </div>

          {/* ================= ORDER SUMMARY & COUPONS COLUMN ================= */}
          <div className="cart-summary-wrapper">
            <div className="cart-summary-card">
              <h2>Order Summary</h2>

              {/* ================= PROMO COUPONS SECTION ================= */}
              <div className="cart-coupons-section">
                <div className="coupon-header">
                  <span className="coupon-title">
                    <i className="bi bi-tag-fill"></i> Apply Coupon / Voucher
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="applied-coupon-card">
                    <div className="applied-coupon-info">
                      <span className="applied-tag">
                        <i className="bi bi-check-circle-fill"></i> {appliedCoupon.code}
                      </span>
                      <span className="applied-desc">
                        {appliedCoupon.description} (-${discountAmount.toFixed(2)})
                      </span>
                    </div>
                    <button
                      type="button"
                      className="remove-coupon-btn"
                      onClick={handleRemoveCoupon}
                      title="Remove coupon"
                    >
                      <i className="bi bi-x-lg"></i>
                    </button>
                  </div>
                ) : (
                  <div className="coupon-input-group">
                    <input
                      type="text"
                      className="coupon-input"
                      placeholder="Enter promo code (e.g. STORE10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="coupon-apply-btn"
                      onClick={() => handleApplyCoupon()}
                    >
                      Apply
                    </button>
                  </div>
                )}

                {couponError && (
                  <div className="coupon-feedback error">
                    <i className="bi bi-exclamation-circle"></i> {couponError}
                  </div>
                )}

                {couponSuccess && (
                  <div className="coupon-feedback success">
                    <i className="bi bi-check2-circle"></i> {couponSuccess}
                  </div>
                )}

                {/* Quick-Apply Promo Chips */}
                {!appliedCoupon && (
                  <div className="available-coupons-chips">
                    <span className="chips-label">Quick Apply:</span>
                    <div className="chips-container">
                      {AVAILABLE_COUPONS.map((cp) => (
                        <button
                          key={cp.code}
                          type="button"
                          className="coupon-chip"
                          onClick={() => handleApplyCoupon(cp.code)}
                          title={`${cp.description}${cp.minOrder ? ` (Min $${cp.minOrder})` : ""}`}
                        >
                          <span className="chip-code">{cp.code}</span>
                          <span className="chip-save">
                            {cp.type === "percent" ? `${cp.value}% OFF` : `$${cp.value} OFF`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="summary-divider"></div>

              {/* Price Line Items */}
              <div className="summary-row">
                <span>Subtotal ({validItems.length} items)</span>
                <strong>${subtotal.toFixed(2)}</strong>
              </div>

              {appliedCoupon && (
                <div className="summary-row discount-row">
                  <span className="discount-label">
                    <i className="bi bi-tag-fill"></i> Promo Discount ({appliedCoupon.code})
                  </span>
                  <strong className="discount-value">-${discountAmount.toFixed(2)}</strong>
                </div>
              )}

              <div className="summary-row">
                <span>Standard Delivery</span>
                <span className="free-shipping-tag">FREE</span>
              </div>

              <div className="summary-row">
                <span>Estimated Tax</span>
                <span>$0.00</span>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total-row">
                <span>Total Amount</span>
                <strong className="summary-total-amount">${finalTotalPrice}</strong>
              </div>

              {/* Selected Payment Indicator */}
              <div className="summary-payment-chosen">
                <i className="bi bi-shield-check"></i>
                <span>
                  Paying via:{" "}
                  <strong>
                    {PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.name || "Credit / Debit Card"}
                  </strong>
                </span>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={loading}
                onClick={handlePlaceOrder}
              >
                <i className="bi bi-bag-check-fill"></i> Place Order (${finalTotalPrice})
              </Button>

              <div className="order-security-strip">
                <i className="bi bi-patch-check-fill"></i> 100% Purchase Protection & Easy 30-Day Returns
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-cart-view">
          <div className="empty-cart-icon">
            <i className="bi bi-cart-x"></i>
          </div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven&apos;t added any products to your cart yet.</p>
          <Link to="/" className="btn btn-primary btn-md">
            <i className="bi bi-bag"></i> Discover Products
          </Link>
        </div>
      )}

      {message && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={() => {
            const isSuccess = messageType === "success" && message.includes("Order placed");
            dispatch(clearCartMessage());
            if (isSuccess) {
              navigate("/orders");
            }
          }}
        />
      )}
    </div>
  );
};

export default Cart;
