const express = require("express");
const router = express.Router();
const userControllers = require("../controllers/userControllers");
const authenticateToken = require("../../common/middleware/authMiddleware");
const {
  validateUserRegistration,
  validateUserLogin,
} = require("../../common/middleware/validationMiddleware");

// User routes with strict input validation
router.post("/register", validateUserRegistration, userControllers.registerUser);
router.post("/login", validateUserLogin, userControllers.loginUser);
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
