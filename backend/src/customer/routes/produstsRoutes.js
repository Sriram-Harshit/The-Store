const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productControllers");
const {
  validateIdParam,
  validateReviewInput,
} = require("../../common/middleware/validationMiddleware");

router.get("/products", productControllers.products);
router.get("/search", productControllers.searchProducts);
router.get("/:id", validateIdParam("id"), productControllers.getProductById);
router.post("/:id/review", validateIdParam("id"), validateReviewInput, productControllers.addReview);

module.exports = router;
