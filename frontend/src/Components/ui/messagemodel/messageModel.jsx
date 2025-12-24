import { useEffect } from "react";
import "./messageModal.css";

const MessageModal = ({
  message,
  type = "info",
  onClose,
  autoClose = true,
  duration = 2500,
}) => {
  useEffect(() => {
    if (!autoClose || !message) return;

    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, autoClose, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default MessageModal;
