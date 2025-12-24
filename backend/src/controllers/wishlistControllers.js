const Wishlist = require("../models/wishlistModel");

// Add or remove product from wishlist
const addToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;
  if (!userId || !productId) {
    return res
      .status(400)
      .json({ error: "User ID and Product ID are required" });
  }

  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [productId] });
    } else {
      if (wishlist.items.includes(productId)) {
        wishlist.items = wishlist.items.filter(
          (item) => item.toString() !== productId.toString()
        );
      } else {
        wishlist.items.push(productId);
      }
    }

    await wishlist.save();
    res.status(200).json({
      message: wishlist.items.includes(productId)
        ? "Product added to wishlist successfully."
        : "Product removed from wishlist successfully.",
    });
  } catch (err) {
    res.status(500).json({
      error: "An error occurred while updating the wishlist.",
    });
  }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
  const userId = req.user.userId;

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate("items");

    if (!wishlist) {
      return res.status(200).json({ userId, items: [] });
    }

    res.status(200).json(wishlist);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.userId;

  if (!userId || !productId) {
    return res
      .status(400)
      .json({ error: "User ID and Product ID are required" });
  }

  try {
    const result = await Wishlist.updateOne(
      { userId },
      { $pull: { items: productId } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    res.status(200).json({ message: "Product removed from wishlist" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove product from wishlist" });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
