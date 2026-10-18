const Product = require("../../common/models/productModel");

const products = async (req, res) => {
  try {
    // Enable edge and browser caching to ensure instant loads
    res.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=1800, stale-while-revalidate=86400"
    );

    // .lean() avoids instantiating heavy Mongoose Document models for 180+ items
    const products = await Product.find({
      approvalStatus: { $nin: ["pending", "rejected"] },
    }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const searchProducts = async (req, res) => {
  const { query, category, minPrice, maxPrice, brand } = req.query;

  try {
    const searchQuery = (query || "").trim();
    const filter = {
      approvalStatus: { $nin: ["pending", "rejected"] },
    };

    if (category && category !== "All") {
      filter.type = category;
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: "i" } },
        { brand: { $regex: searchQuery, $options: "i" } },
        { type: { $regex: searchQuery, $options: "i" } },
        { tags: { $in: [new RegExp(searchQuery, "i")] } },
        { "specs.processor": { $regex: searchQuery, $options: "i" } },
        { "specs.ram": { $regex: searchQuery, $options: "i" } },
        { "specs.storage": { $regex: searchQuery, $options: "i" } },
        { description: { $regex: searchQuery, $options: "i" } },
      ];
    }

    res.set(
      "Cache-Control",
      "public, max-age=120, s-maxage=600, stale-while-revalidate=3600"
    );

    const products = await Product.find(filter).lean();
    res.status(200).json({ results: products });
  } catch (error) {
    res.status(500).json({ error: "Failed to search products." });
  }
};

const addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ message: "Rating and comment are required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const review = {
      userName: userName || "Verified Customer",
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date(),
    };

    if (!product.reviews) product.reviews = [];
    product.reviews.unshift(review);
    if (!product.ratings) product.ratings = [];
    product.ratings.push(Number(rating));

    await product.save();
    res.status(201).json({ message: "Review posted successfully!", review, product });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit review" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product details" });
  }
};

module.exports = { products, searchProducts, addReview, getProductById };
