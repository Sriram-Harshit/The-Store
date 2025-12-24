const express = require("express");
const router = express.Router();
const ordersController = require("../controllers/ordersControllers");

router.post("/placeOrder", ordersController.placeOrder);

router.get("/getOrders", ordersController.getOrders);

router.post("/cancelOrder", ordersController.cancelOrder);

module.exports = router;
