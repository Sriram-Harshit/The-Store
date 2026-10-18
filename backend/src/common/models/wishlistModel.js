const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Wishlist = mongoose.model("Wishlist", wishlistSchema, "Wishlists");

module.exports = Wishlist;
