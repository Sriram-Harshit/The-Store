const express = require("express");
const router = express.Router();
const authenticateToken = require("../common/middleware/authMiddleware");
const { requireAdmin } = require("../common/middleware/rbacMiddleware");
const { validateIdParam } = require("../common/middleware/validationMiddleware");
const {
  getAdminOverview,
  getSellers,
  updateSellerStatus,
  getUsers,
  updateUserRole,
  updateUserStatus,
  getAdminProducts,
  updateProductApprovalStatus,
  deleteAdminProduct,
} = require("./adminControllers");

// Protect all admin routes with JWT authentication and requireAdmin check
router.use(authenticateToken, requireAdmin);

router.get("/overview", getAdminOverview);
router.get("/sellers", getSellers);
router.patch("/sellers/:id/status", validateIdParam("id"), updateSellerStatus);
router.get("/users", getUsers);
router.patch("/users/:id/role", validateIdParam("id"), updateUserRole);
router.patch("/users/:id/status", validateIdParam("id"), updateUserStatus);
router.get("/products", getAdminProducts);
router.patch("/products/:id/status", validateIdParam("id"), updateProductApprovalStatus);
router.delete("/products/:id", validateIdParam("id"), deleteAdminProduct);

module.exports = router;
