const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartControllers");

router.post("/cartUpdate", cartController.addToCart);
router.get("/getcart/user", cartController.getCart);
router.delete("/removeItem", cartController.removeFromCart);
router.post("/clearCart", cartController.clearCart);

module.exports = router;
