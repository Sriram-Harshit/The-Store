import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../common/ui/buttons/button";
import "./AdminDesktopOnlyGuard.css";

const LAPTOP_MIN_WIDTH = 1024;

const AdminDesktopOnlyGuard = ({ children }) => {
  const navigate = useNavigate();
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLaptopOrDesktop = windowWidth >= LAPTOP_MIN_WIDTH;

  if (isLaptopOrDesktop) {
    return children;
  }

  return (
    <div className="admin-laptop-guard-screen">
      <div className="admin-laptop-guard-card">
        {/* Emblem */}
        <div className="guard-icon-container">
          <div className="guard-icon-ring"></div>
          <i className="bi bi-laptop guard-icon"></i>
          <span className="guard-lock-badge">
            <i className="bi bi-lock-fill"></i>
          </span>
        </div>

        {/* Tag */}
        <div className="guard-tag">
          <i className="bi bi-shield-slash-fill"></i> DESKTOP & LAPTOP SYSTEM REQUIRED
        </div>

        {/* Title & Description */}
        <h1>Platform Admin Console</h1>
        <p className="guard-subtitle">
          The Store Administrator Console requires a laptop or desktop workstation with a wide monitor display to access security audits, seller vetting workflows, and system data grids.
        </p>

        {/* Diagnostics Box */}
        <div className="guard-diagnostic-box">
          <div className="diag-row">
            <span className="diag-label">Detected Screen Width:</span>
            <span className="diag-value diag-error">
              <i className="bi bi-phone"></i> {windowWidth}px (Mobile / Tablet)
            </span>
          </div>
          <div className="diag-row">
            <span className="diag-label">Minimum Required Width:</span>
            <span className="diag-value diag-req">
              <i className="bi bi-display"></i> ≥ {LAPTOP_MIN_WIDTH}px (Laptop / PC)
            </span>
          </div>
          <div className="diag-row">
            <span className="diag-label">Console Status:</span>
            <span className="diag-value diag-badge">
              <i className="bi bi-shield-lock"></i> Restricted on Small Displays
            </span>
          </div>
        </div>

        <p className="guard-instruction">
          Please open this management link on your <strong>laptop or desktop computer</strong>, or expand your browser window to at least <strong>1024px</strong> width.
        </p>

        {/* Actions */}
        <div className="guard-actions-row">
          <Button
            variant="primary"
            size="md"
            icon={<i className="bi bi-arrow-left"></i>}
            onClick={() => navigate("/")}
          >
            Return to Storefront
          </Button>

          <Button
            variant="outline"
            size="md"
            icon={<i className="bi bi-shop"></i>}
            onClick={() => navigate("/seller")}
          >
            Visit Seller Hub
          </Button>

          <button
            type="button"
            className="guard-recheck-btn"
            onClick={() => setWindowWidth(window.innerWidth)}
            title="Recheck screen width"
          >
            <i className="bi bi-arrow-clockwise"></i> Re-check Display
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDesktopOnlyGuard;
