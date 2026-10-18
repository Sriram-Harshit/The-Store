import { useState, useEffect } from "react";
import "./loader.css";

const DEFAULT_MESSAGES = [
  "Curating premium catalog...",
  "Syncing latest deals & inventory...",
  "Preparing smooth checkout...",
  "Almost ready for you...",
];

const GoodLoader = ({
  message,
  fullScreen = false,
  messages = DEFAULT_MESSAGES,
}) => {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (message) return; // If a static message is provided, don't cycle
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [message, messages.length]);

  const displayMessage = message || messages[msgIndex];

  return (
    <div
      className={`good-loader-container ${
        fullScreen ? "good-loader-fullscreen" : "good-loader-inline"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="good-loader-content">
        {/* Orbital Glowing Rings & Brand Icon */}
        <div className="loader-portal-wrap">
          <div className="loader-ring ring-outer"></div>
          <div className="loader-ring ring-middle"></div>
          <div className="loader-ring ring-inner"></div>

          <div className="loader-core-icon">
            <i className="bi bi-bag-heart-fill"></i>
          </div>

          <div className="loader-orbit-sparkle sparkle-1"></div>
          <div className="loader-orbit-sparkle sparkle-2"></div>
        </div>

        {/* Brand Name */}
        <h3 className="loader-brand-title">
          The<span className="brand-gradient-text">Store</span>
        </h3>

        {/* Dynamic cycling message */}
        <p className="loader-status-message">
          {displayMessage}
        </p>

        {/* Shimmering Progress Bar */}
        <div className="loader-progress-track">
          <div className="loader-progress-bar"></div>
        </div>
      </div>
    </div>
  );
};

export default GoodLoader;
