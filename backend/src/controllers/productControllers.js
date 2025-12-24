const Product = require("../models/productModel");

const products = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// productController.js
const searchProducts = async (req, res) => {
  const { query } = req.query;

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { type: { $regex: query, $options: "i" } },
      ],
    });

    res.status(200).json({ results: products });
  } catch (error) {
    res.status(500).json({ error: "Failed to search products." });
  }
};

module.exports = { products, searchProducts };
