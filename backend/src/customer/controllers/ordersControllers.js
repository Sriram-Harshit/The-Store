const Order = require("../../common/models/orderModel");

// Place an order
const placeOrder = async (req, res) => {
  const { cartItems, totalPrice, paymentMethod, couponApplied, discountAmount } = req.body;
  const { userId } = req.user;

  try {
    const items = cartItems.map((item) => ({
      productId: item.productId?._id || item.productId,
      quantity: item.quantity,
      price: item.price || item.productId?.price || 0,
    }));

    const order = new Order({
      userId,
      items,
      totalPrice,
      paymentMethod: paymentMethod || "Credit/Debit Card",
      couponApplied: couponApplied || null,
      discountAmount: Number(discountAmount) || 0,
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

    if (result.matchedCount === 0) {
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
