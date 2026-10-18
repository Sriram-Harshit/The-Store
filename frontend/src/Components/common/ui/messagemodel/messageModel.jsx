import { useEffect } from "react";
import "./messageModal.css";

const MessageModal = ({
  message,
  type = "info",
  onClose,
  autoClose = true,
  duration = 2800,
}) => {
  useEffect(() => {
    if (!autoClose || !message) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">
        {type === "success" && <i className="bi bi-check-circle-fill"></i>}
        {type === "error" && <i className="bi bi-exclamation-octagon-fill"></i>}
        {type === "warning" && <i className="bi bi-exclamation-triangle-fill"></i>}
        {type === "info" && <i className="bi bi-info-circle-fill"></i>}
      </span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss notification">
        <i className="bi bi-x-lg"></i>
      </button>
    </div>
  );
};

export default MessageModal;
