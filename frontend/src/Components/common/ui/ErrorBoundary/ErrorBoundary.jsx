import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("TheStore UI Error caught by boundary:", error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem("thestore_cached_products_v1");
      localStorage.removeItem("thestore_cached_products_v2");
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
            color: "#1e1b4b",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "#fee2e2",
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.2rem",
              marginBottom: "1.2rem",
            }}
          >
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, margin: "0 0 0.5rem" }}>
            Something went wrong while loading this page
          </h2>
          <p style={{ color: "#64748b", maxWidth: "480px", margin: "0 0 1.5rem" }}>
            {this.state.error?.message || "An unexpected rendering error occurred."}
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: "#7c3aed",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                padding: "0.75rem 1.4rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              <i className="bi bi-arrow-repeat"></i> Reload Page
            </button>
            <button
              onClick={this.handleReset}
              style={{
                background: "#f1f5f9",
                color: "#334155",
                border: "1px solid #cbd5e1",
                borderRadius: "10px",
                padding: "0.75rem 1.4rem",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Reset Cache & Return Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
