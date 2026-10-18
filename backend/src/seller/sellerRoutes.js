const express = require("express");
const router = express.Router();
const authenticateToken = require("../common/middleware/authMiddleware");
const { requireSeller } = require("../common/middleware/rbacMiddleware");
const { validateProductInput, validateIdParam } = require("../common/middleware/validationMiddleware");
const {
  getSellerDashboard,
  getSellerProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerOrders,
  updateSellerOrderStatus,
  updateSellerProfile,
  getSellerDocuments,
  submitSellerDocuments,
} = require("./sellerControllers");

// Protect all seller routes with JWT authentication and requireSeller check
router.use(authenticateToken, requireSeller);

router.get("/dashboard", getSellerDashboard);
router.get("/documents", getSellerDocuments);
router.post("/documents", submitSellerDocuments);
router.get("/products", getSellerProducts);
router.post("/products", validateProductInput, createProduct);
router.put("/products/:id", validateIdParam("id"), updateProduct);
router.delete("/products/:id", validateIdParam("id"), deleteProduct);
router.get("/orders", getSellerOrders);
router.patch("/orders/:orderId/status", validateIdParam("orderId"), updateSellerOrderStatus);
router.put("/profile", updateSellerProfile);

module.exports = router;
