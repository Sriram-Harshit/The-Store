import { Link } from "react-router-dom";
import "./Welcome.css";

const Welcome = () => {
  return (
    <div className="welcome-page">
      <div className="welcome-container">
        {/* Brand Header */}
        <div className="welcome-header">
          <div className="welcome-logo">
            <i className="bi bi-bag-heart-fill"></i>
          </div>
          <h1>Welcome to TheStore</h1>
          <p className="welcome-subtitle">
            Enterprise Full-Stack Marketplace with Role-Based Access Control (RBAC).
            <br />
            Select a portal below to explore its live features:
          </p>
        </div>

        {/* 3 Role Showcase Cards */}
        <div className="welcome-grid">
          {/* Card 1: Customer Store */}
          <Link to="/user" className="welcome-card customer">
            <div className="card-top-tag">CONSUMER PORTAL</div>
            <div className="card-icon">
              <i className="bi bi-shop"></i>
            </div>
            <h2>Customer Store</h2>
            <p className="card-tagline">
              Complete consumer retail shopping experience with live product catalog and order pipeline.
            </p>

            <div className="card-features-list">
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Browse 100+ items across 7 categories</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Real-time search, filters & spec inspection</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Shopping cart calculations & checkout</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Order tracking & history receipts</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>AI-powered shopping concierge chatbot</span>
              </div>
            </div>

            <div className="card-creds-box">
              <span className="creds-label">TEST CREDENTIALS:</span>
              <code>customer@thestore.com</code> / <code>user123</code>
            </div>

            <div className="welcome-btn-wrap">
              <span className="welcome-btn">
                Enter Customer Store <i className="bi bi-arrow-right"></i>
              </span>
            </div>
          </Link>

          {/* Card 2: Seller Hub */}
          <Link to="/seller" className="welcome-card seller">
            <div className="card-top-tag">MERCHANT PORTAL</div>
            <div className="card-icon">
              <i className="bi bi-box-seam"></i>
            </div>
            <h2>Seller Hub</h2>
            <p className="card-tagline">
              Merchant management workstation to control catalog stock, fulfill orders, and submit KYC documents.
            </p>

            <div className="card-features-list">
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Live revenue, sales & order telemetry</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Inventory stock management & live updates</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Create new products with deep specifications</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Order fulfillment & shipping status dispatch</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Business KYC & tax dossier compliance</span>
              </div>
            </div>

            <div className="card-creds-box">
              <span className="creds-label">TEST CREDENTIALS:</span>
              <code>apextech@thestore.com</code> / <code>seller123</code>
            </div>

            <div className="welcome-btn-wrap">
              <span className="welcome-btn">
                Enter Seller Hub <i className="bi bi-arrow-right"></i>
              </span>
            </div>
          </Link>

          {/* Card 3: Admin Console */}
          <Link to="/admin" className="welcome-card admin">
            <div className="card-top-tag">GOVERNANCE PORTAL</div>
            <div className="card-icon">
              <i className="bi bi-shield-lock-fill"></i>
            </div>
            <h2>Admin Console</h2>
            <p className="card-tagline">
              Platform administration control room for merchant vetting, catalog moderation, and user governance.
            </p>

            <div className="card-features-list">
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Review & approve/reject seller applications</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Moderate and approve catalog products</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>User role management (User, Seller, Admin)</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Account suspension & security controls</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-check-circle-fill"></i>
                <span>Platform health & gross revenue metrics</span>
              </div>
            </div>

            <div className="card-creds-box">
              <span className="creds-label">TEST CREDENTIALS:</span>
              <code>admin@thestore.com</code> / <code>admin123</code>
            </div>

            <div className="welcome-btn-wrap">
              <span className="welcome-btn">
                Enter Admin Console <i className="bi bi-arrow-right"></i>
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
