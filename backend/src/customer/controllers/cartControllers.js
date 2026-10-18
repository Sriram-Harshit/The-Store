const Cart = require("../../common/models/cartsModel");

// Add or update item in cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId && item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    } else {
      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );

    const safeItems = populatedCart.items.filter((item) => item.productId != null);
    res.status(200).json({ items: safeItems });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product to cart" });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) {
      return res.status(200).json({ items: [] });
    }
    const safeItems = cart.items.filter((item) => item.productId != null);
    res.status(200).json({ ...cart.toObject(), items: safeItems });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({ items: [] });
    }

    cart.items = cart.items.filter(
      (item) => item.productId && item.productId.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );

    const safeItems = populatedCart.items.filter((item) => item.productId != null);
    res.status(200).json({ items: safeItems });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove product from cart" });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    await Cart.updateOne({ userId }, { $set: { items: [] } });

    res.status(200).json({ items: [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cart." });
  }
};

module.exports = {
  addToCart,
  getCart,
  removeFromCart,
  clearCart,
};
