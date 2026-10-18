require("dotenv").config();
require("dotenv").config({ path: "../.env" });

const express = require("express");
const cors = require("cors");

const connectToDatabase = require("./src/common/dbconfig/dbConfig");
const userRoutes = require("./src/customer/routes/userRoutes");
const produstsRoutes = require("./src/customer/routes/produstsRoutes");
const cartRoutes = require("./src/customer/routes/cartRoutes");
const wishlistRoutes = require("./src/customer/routes/wishlistRoutes");
const orderRoutes = require("./src/customer/routes/orderRoutes");
const adminRoutes = require("./src/admin/adminRoutes");
const sellerRoutes = require("./src/seller/sellerRoutes");
const authenticateToken = require("./src/common/middleware/authMiddleware");
const { requireCustomer } = require("./src/common/middleware/rbacMiddleware");
const { requestLogger, errorHandler } = require("./src/common/middleware/loggerMiddleware");

const app = express();

const allowedOrigins = [
  "https://the-store-fra4.vercel.app",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes("vercel.app") || origin.includes("localhost")) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Warm up database connection on initial load
connectToDatabase().catch(() => {});

app.get("/", (req, res) => {
  res.send("Backend running on Vercel 🚀");
});

// Database connection gatekeeper for Serverless cold-starts
app.use(async (req, res, next) => {
  if (req.path === "/") {
    return next();
  }

  if (!process.env.MONGO_URI) {
    return res.status(503).json({
      error: "DATABASE_NOT_CONFIGURED",
      message: "MONGO_URI environment variable is not configured on this server.",
    });
  }

  try {
    await connectToDatabase();
    next();
  } catch (err) {
    return res.status(500).json({
      error: "DATABASE_CONNECTION_ERROR",
      message: `Failed to connect to database: ${err.message}`,
    });
  }
});

// Standard routes
app.use("/users", userRoutes);
app.use("/product", produstsRoutes);
app.use("/cart", authenticateToken, requireCustomer, cartRoutes);
app.use("/wishlist", authenticateToken, requireCustomer, wishlistRoutes);
app.use("/orders", authenticateToken, requireCustomer, orderRoutes);
app.use("/admin", adminRoutes);
app.use("/seller", sellerRoutes);

// /api prefixed routes support
app.use("/api/users", userRoutes);
app.use("/api/product", produstsRoutes);
app.use("/api/cart", authenticateToken, requireCustomer, cartRoutes);
app.use("/api/wishlist", authenticateToken, requireCustomer, wishlistRoutes);
app.use("/api/orders", authenticateToken, requireCustomer, orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);

// Centralized error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 TheStore Backend running on http://localhost:${PORT}`);
  });
}

module.exports = app;
