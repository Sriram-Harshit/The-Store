import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { notify } from "../../../utils/notify";
import "./Footer.css";

const Footer = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Hide footer on dedicated admin or seller portal pages, full-screen role logins, and welcome page
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/seller") ||
    location.pathname === "/admin/login" ||
    location.pathname === "/seller/login" ||
    location.pathname === "/welcome"
  ) {
    return null;
  }

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      notify("Please enter a valid email address.", "warning");
      return;
    }
    setSubscribed(true);
    notify("Thank you! You're subscribed to TheStore exclusive product drops.", "success");
    setEmail("");
  };

  const handleOpenAssistant = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"));
  };

  return (
    <footer className="site-footer">
      {/* 1. Value Proposition Highlights Strip */}
      <div className="footer-highlights-strip">
        <div className="footer-container">
          <div className="footer-highlights-grid">
            <div className="highlight-item">
              <div className="highlight-icon">
                <i className="bi bi-truck"></i>
              </div>
              <div className="highlight-text">
                <strong>Free Express Shipping</strong>
                <span>On all catalog orders across all categories</span>
              </div>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon">
                <i className="bi bi-patch-check-fill"></i>
              </div>
              <div className="highlight-text">
                <strong>100% Authentic Quality</strong>
                <span>Direct from verified and approved merchants</span>
              </div>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon">
                <i className="bi bi-arrow-repeat"></i>
              </div>
              <div className="highlight-text">
                <strong>7-Day Easy Returns</strong>
                <span>Hassle-free replacement & swift refunds</span>
              </div>
            </div>

            <div className="highlight-item">
              <div className="highlight-icon">
                <i className="bi bi-shield-lock-fill"></i>
              </div>
              <div className="highlight-text">
                <strong>256-Bit Encrypted Checkout</strong>
                <span>Bank-grade security & buyer protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Navigation Grid */}
      <div className="footer-main-section">
        <div className="footer-container">
          <div className="footer-columns-grid">
            {/* Col 1: Brand & Mission */}
            <div className="footer-col brand-col">
              <Link to="/" className="footer-logo">
                <span className="logo-badge">
                  <i className="bi bi-bag-heart-fill"></i>
                </span>
                <span className="logo-text">TheStore</span>
              </Link>
              <p className="footer-tagline">
                The modern marketplace destination for elite computing, streetwear apparel,
                Scandinavian living, computer science literature, athletic performance, and clean clinical beauty.
              </p>

              <div className="footer-social-links">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  className="social-btn"
                >
                  <i className="bi bi-github"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter / X"
                  className="social-btn"
                >
                  <i className="bi bi-twitter-x"></i>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                  className="social-btn"
                >
                  <i className="bi bi-instagram"></i>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  className="social-btn"
                >
                  <i className="bi bi-linkedin"></i>
                </a>
              </div>
            </div>

            {/* Col 2: Shop by Category */}
            <div className="footer-col">
              <h4 className="footer-col-title">Explore Categories</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link to="/?category=Electronics">
                    <i className="bi bi-laptop"></i> Electronics & Audio
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Clothing">
                    <i className="bi bi-tag-fill"></i> Designer Clothing
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Home">
                    <i className="bi bi-house-door"></i> Nordic Living & Decor
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Books">
                    <i className="bi bi-book-half"></i> Books & Software Architecture
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Sports">
                    <i className="bi bi-activity"></i> Sports & Athletic Gear
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Beauty">
                    <i className="bi bi-stars"></i> Beauty & Personal Care
                  </Link>
                </li>
                <li>
                  <Link to="/?category=Toys">
                    <i className="bi bi-controller"></i> Toys & Tech Gadgets
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Care & Services */}
            <div className="footer-col">
              <h4 className="footer-col-title">Account & Services</h4>
              <ul className="footer-nav-list">
                <li>
                  <Link to="/orders">
                    <i className="bi bi-receipt"></i> Track My Orders
                  </Link>
                </li>
                <li>
                  <Link to="/cart">
                    <i className="bi bi-cart3"></i> Shopping Bag
                  </Link>
                </li>
                <li>
                  <Link to="/profile">
                    <i className="bi bi-person"></i> Customer Profile
                  </Link>
                </li>
                <li>
                  <Link to="/seller">
                    <i className="bi bi-shop"></i> Sell on TheStore
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    className="footer-assistant-link"
                    onClick={handleOpenAssistant}
                  >
                    <i className="bi bi-chat-dots-fill"></i> AI Shopping Concierge
                  </button>
                </li>
                <li>
                  <Link to="/admin/login">
                    <i className="bi bi-shield-lock"></i> Operations Gateway
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 4: Newsletter & Exclusive Drops */}
            <div className="footer-col newsletter-col">
              <h4 className="footer-col-title">Exclusive Drops</h4>
              <p className="newsletter-desc">
                Subscribe for early access to limited edition drops, flash sales, and developer discounts.
              </p>

              <form onSubmit={handleSubscribe} className="footer-newsletter-form">
                <div className="newsletter-input-wrap">
                  <i className="bi bi-envelope"></i>
                  <input
                    type="email"
                    placeholder="Enter your email..."
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-label="Email address for newsletter"
                    required
                  />
                  <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe">
                    <i className="bi bi-arrow-right"></i>
                  </button>
                </div>
              </form>
              {subscribed && (
                <span className="newsletter-success-note">
                  <i className="bi bi-check-circle-fill"></i> You are all set! Check your inbox soon.
                </span>
              )}

              <div className="store-app-meta">
                <span className="meta-badge">
                  <i className="bi bi-check2-circle"></i> 100 Products In Stock
                </span>
                <span className="meta-badge">
                  <i className="bi bi-globe-americas"></i> Nationwide Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Payment Strip */}
      <div className="footer-bottom-strip">
        <div className="footer-container bottom-flex">
          <div className="copyright-text">
            <span>&copy; {new Date().getFullYear()} TheStore Inc. All rights reserved.</span>
            <div className="legal-links">
              <a href="#privacy">Privacy Policy</a>
              <span className="sep">&bull;</span>
              <a href="#terms">Terms of Service</a>
              <span className="sep">&bull;</span>
              <a href="#security">Security & Compliance</a>
            </div>
          </div>

          <div className="payment-badges-row">
            <span className="payment-label">Accepted Payments:</span>
            <div className="payment-icons">
              <span className="pay-chip" title="Visa Card">
                <i className="bi bi-credit-card-2-front"></i> Visa
              </span>
              <span className="pay-chip" title="Mastercard">
                <i className="bi bi-credit-card"></i> Mastercard
              </span>
              <span className="pay-chip" title="Apple Pay">
                <i className="bi bi-apple"></i> Apple Pay
              </span>
              <span className="pay-chip" title="Google Pay">
                <i className="bi bi-google"></i> G Pay
              </span>
              <span className="pay-chip" title="PayPal">
                <i className="bi bi-paypal"></i> PayPal
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
