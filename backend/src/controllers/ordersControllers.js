const Order = require("../models/orderModel");

// Place an order
const placeOrder = async (req, res) => {
  const { cartItems, totalPrice } = req.body;
  const { userId } = req.user;

  try {
    const items = cartItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.productId.price,
    }));

    const order = new Order({
      userId,
      items,
      totalPrice,
    });

    await order.save();
    res.status(200).json({ message: "Order placed successfully.", order });
  } catch (err) {
    res.status(500).json({ error: "Failed to place order." });
  }
};

// Get user's orders
const getOrders = async (req, res) => {
  const { userId } = req.user;

  try {
    const orders = await Order.find({ userId }).populate({
      path: "items.productId",
      select: "name imageUrl price",
    });

    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders." });
  }
};

// Cancel an order
const cancelOrder = async (req, res) => {
  const { orderId } = req.body;

  try {
    const result = await Order.updateOne(
      { _id: orderId, userId: req.user.userId },
      { $set: { status: "Cancelled" } }
    );

    if (result.nModified === 0) {
      return res
        .status(404)
        .json({ message: "Order not found or already cancelled." });
    }

    res.status(200).json({ message: "Order cancelled successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel order." });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  cancelOrder,
};
