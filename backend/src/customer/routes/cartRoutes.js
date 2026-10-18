const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartControllers");
const { validateCartInput } = require("../../common/middleware/validationMiddleware");

router.post("/cartUpdate", validateCartInput, cartController.addToCart);
router.get("/getcart/user", cartController.getCart);
router.delete("/removeItem", cartController.removeFromCart);
router.post("/clearCart", cartController.clearCart);

module.exports = router;
