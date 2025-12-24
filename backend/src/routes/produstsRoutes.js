const express = require("express");
const router = express.Router();
const productControllers = require("../controllers/productControllers");

router.get("/products", productControllers.products);
router.get("/search", productControllers.searchProducts);

module.exports = router;
