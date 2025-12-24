const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");
const authenticateToken = require("../middleware/authMiddleware");

// User routes
router.post("/register", userControllers.registerUser);
router.post("/login", userControllers.loginUser);
router.post("/logout", userControllers.logoutUser);

// Profile routes (authenticated)
router.get(
  "/profile/profileDetails",
  authenticateToken,
  userControllers.userProfile
);
router.put("/profile", authenticateToken, userControllers.updateProfile);

// Address management routes (authenticated)
router.get(
  "/:userId/addresses",
  authenticateToken,
  userControllers.getAddresses
);
router.post(
  "/profile/addresses",
  authenticateToken,
  userControllers.addAddress
);
router.put(
  "/profile/address/:addressId",
  authenticateToken,
  userControllers.updateAddress
);
router.delete(
  "/profile/address/:addressId",
  authenticateToken,
  userControllers.deleteAddress
);

module.exports = router;
