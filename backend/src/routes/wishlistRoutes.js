const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistControllers");

router.post("/wishlistUpdate", wishlistController.addToWishlist);
router.get("/getuserwishlist", wishlistController.getWishlist);
router.delete("/wishlist", wishlistController.removeFromWishlist);

module.exports = router;
