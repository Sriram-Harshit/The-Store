import { useSelector, useDispatch } from "react-redux";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Button from "../Components/common/ui/buttons/button";
import { logout } from "../store/slices/authSlice";

const ProtectedRoute = ({ allowedRoles = ["user"] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user, token } = useSelector((state) => state.auth);

  if (!isLoggedIn || !token) {
    if (allowedRoles.includes("admin")) {
      return <Navigate to="/admin/login" replace />;
    }
    if (allowedRoles.includes("seller")) {
      return <Navigate to="/seller/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  const rawRole = (user?.accountType || user?.role || "user").toLowerCase();
  const currentRole = rawRole === "regular" ? "user" : rawRole;

  const isAllowed = allowedRoles.map((r) => r.toLowerCase()).includes(currentRole);

  if (!isAllowed) {
    const roleTitleMap = {
      user: "Customer Shopping",
      seller: "Merchant Seller Hub",
      admin: "Platform Administrator Console",
    };

    const targetPortal =
      currentRole === "seller" ? "/seller" : currentRole === "admin" ? "/admin" : "/user";
    const targetLabel =
      currentRole === "seller"
        ? "Go to Seller Hub"
        : currentRole === "admin"
        ? "Go to Admin Console"
        : "Go to Customer Store";

    return (
      <div style={{ maxWidth: "600px", margin: "4rem auto", padding: "0 1.5rem" }}>
        <div
          style={{
            background: "#ffffff",
            borderRadius: "20px",
            border: "1.5px solid #ede9fe",
            boxShadow: "0 16px 40px rgba(91, 33, 182, 0.08)",
            padding: "2.5rem 2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#fef2f2",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              margin: "0 auto 1.25rem",
              border: "1px solid #fecaca",
            }}
          >
            <i className="bi bi-shield-lock-fill"></i>
          </div>

          <h2 style={{ fontSize: "1.45rem", color: "#1e1b4b", marginBottom: "0.5rem" }}>
            Access Restricted: {allowedRoles.map((r) => roleTitleMap[r] || r).join(" / ")} Only
          </h2>

          <p style={{ color: "#64748b", fontSize: "0.95rem", lineHeight: "1.5", marginBottom: "1.75rem" }}>
            You are currently signed in as <strong>{user?.email || user?.username}</strong> with role:{" "}
            <span
              style={{
                background: "#f1f5f9",
                padding: "0.2rem 0.5rem",
                borderRadius: "6px",
                fontWeight: "700",
                color: "#475569",
              }}
            >
              {currentRole.toUpperCase()}
            </span>
            .<br />
            This section is reserved exclusively for{" "}
            <strong>{allowedRoles.map((r) => r.toUpperCase()).join(" / ")}</strong> accounts.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxWidth: "380px", margin: "0 auto" }}>
            <Button variant="primary" onClick={() => navigate(targetPortal)}>
              <i className="bi bi-arrow-left-circle"></i> {targetLabel}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                dispatch(logout());
                navigate(allowedRoles.includes("admin") ? "/admin/login" : allowedRoles.includes("seller") ? "/seller/login" : "/login");
              }}
            >
              <i className="bi bi-person-fill-up"></i> Switch to {allowedRoles.map((r) => r.toUpperCase()).join(" / ")} Account
            </Button>

            <button
              type="button"
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                fontSize: "0.85rem",
                cursor: "pointer",
                marginTop: "0.5rem",
              }}
              onClick={() => navigate("/")}
            >
              Return to Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
