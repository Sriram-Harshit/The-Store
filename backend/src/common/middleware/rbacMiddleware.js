const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in with an Administrator account.",
      requiredRole: "admin",
    });
  }

  const role = (req.user.accountType || "").toLowerCase();
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: `Access denied. You are currently logged in with role: "${role}". Platform Administrator privileges are strictly required to perform this action.`,
      currentRole: role,
      requiredRole: "admin",
    });
  }

  next();
};

const requireSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in with a Verified Merchant account.",
      requiredRole: "seller",
    });
  }

  const role = (req.user.accountType || "").toLowerCase();
  if (role !== "seller" && role !== "admin" && role !== "superadmin") {
    return res.status(403).json({
      success: false,
      message: `Access denied. You are currently logged in with role: "${role}". Verified Merchant seller privileges are strictly required to access this portal.`,
      currentRole: role,
      requiredRole: "seller",
    });
  }

  next();
};

const requireCustomer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required. Please sign in to your Customer account.",
      requiredRole: "user",
    });
  }

  const role = (req.user.accountType || "").toLowerCase();
  if (role !== "user" && role !== "regular") {
    return res.status(403).json({
      success: false,
      message: `Access restricted. You are currently logged in as a "${role}". Personal shopping cart, wishlist, and customer orders are strictly reserved for Customer accounts.`,
      currentRole: role,
      requiredRole: "user",
    });
  }

  next();
};

module.exports = {
  requireAdmin,
  requireSeller,
  requireCustomer,
};
