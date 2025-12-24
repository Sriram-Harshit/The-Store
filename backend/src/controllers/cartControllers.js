const Cart = require("../models/cartsModel");

// Add or update item in cart
const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  try {
    let cart = await Cart.findOne({ userId });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
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

    res.status(200).json({ items: populatedCart.items });
  } catch (err) {
    res.status(500).json({ error: "Failed to add product to cart" });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  const userId = req.user.userId;

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    if (!cart) return res.status(404).json({ error: "Cart not found" });
    res.status(200).json(cart);
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

    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate(
      "items.productId"
    );

    res.status(200).json({ items: populatedCart.items });
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
