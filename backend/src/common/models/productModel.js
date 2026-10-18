const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
      default: "TheStore Select",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    type: {
      type: String,
      required: true,
      enum: ["Electronics", "Clothing", "Home", "Books", "Sports", "Beauty", "Toys", "Others"],
      index: true,
    },
    categorySlug: {
      type: String,
      index: true,
    },
    // Detailed Technical & Attribute Specifications
    specs: {
      // Electronics / Laptops / Mobiles
      processor: { type: String },
      ram: { type: String },
      storage: { type: String },
      display: { type: String },
      battery: { type: String },
      graphics: { type: String },
      os: { type: String },

      // Clothing / Fashion
      material: { type: String },
      fit: { type: String },
      gender: { type: String },
      occasion: { type: String },
      season: { type: String },

      // Books
      author: { type: String },
      publisher: { type: String },
      pages: { type: Number },
      genre: { type: String },
      language: { type: String },

      // Electronics / TVs / Displays / Audio
      resolution: { type: String },
      refreshRate: { type: String },
      soundOutput: { type: String },
      screenSize: { type: String },
      smartFeatures: { type: String },

      // Sports & Fitness
      sportType: { type: String },
      resistance: { type: String },
      capacity: { type: String },

      // Beauty & Personal Care
      skinType: { type: String },
      volume: { type: String },
      scent: { type: String },
      ports: { type: String },
      dimensions: { type: String },

      // Generic extras
      color: { type: String },
      weight: { type: String },
      connectivity: { type: String },
    },
    // Legacy details field for backward compatibility
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    // Key Feature Highlights (Bullets on Amazon / Flipkart)
    highlights: {
      type: [String],
      default: [],
    },
    // What's in the Box package contents
    whatsInTheBox: {
      type: [String],
      default: [],
    },
    // Search & Chatbot Matching Tags (e.g., "coding", "gaming", "student", "fast", "cotton")
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 10,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    warranty: {
      type: String,
      default: "1 Year Standard Warranty",
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    sellerName: {
      type: String,
      default: "Verified Store Merchant",
    },
    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "approved",
      index: true,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    ratings: {
      type: [Number],
      default: [4.8],
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        userName: {
          type: String,
          default: "Verified Customer",
        },
        comment: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// ===== HIGH PERFORMANCE INDEXES =====
productSchema.index({ name: "text", description: "text", brand: "text", tags: "text" });
productSchema.index({ type: 1, price: 1 });
productSchema.index({ "specs.processor": 1, "specs.ram": 1 });
productSchema.index({ brand: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model("Products", productSchema, "Products");

module.exports = Product;
