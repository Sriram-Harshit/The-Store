require("node:dns").setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Product = require("../models/productModel");

async function auditAndCleanDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");

  // 1. Normalize any legacy accountType 'regular' to 'user'
  const userRoleUpdate = await User.updateMany(
    { accountType: "regular" },
    { $set: { accountType: "user" } }
  );
  console.log(`Updated legacy 'regular' users to 'user': ${userRoleUpdate.modifiedCount}`);

  // 2. Ensure all sellers have sellerStatus defined
  const sellerStatusUpdate = await User.updateMany(
    { accountType: "seller", sellerStatus: { $in: [null, undefined, ""] } },
    { $set: { sellerStatus: "approved" } }
  );
  console.log(`Initialized sellerStatus for sellers: ${sellerStatusUpdate.modifiedCount}`);

  // 3. Ensure all users have status: 'active'
  const userStatusUpdate = await User.updateMany(
    { status: { $in: [null, undefined, ""] } },
    { $set: { status: "active" } }
  );
  console.log(`Initialized active status for users: ${userStatusUpdate.modifiedCount}`);

  // 4. Check user counts by role
  const userCounts = await User.aggregate([
    { $group: { _id: "$accountType", count: { $sum: 1 } } },
  ]);
  console.log("Current User Breakdown in MongoDB:", userCounts);

  // 5. Audit products: ensure non-negative stock and prices
  const productClean = await Product.updateMany(
    { stock: { $lt: 0 } },
    { $set: { stock: 0 } }
  );
  console.log(`Fixed negative product stock: ${productClean.modifiedCount}`);

  console.log("✅ Database audit and normalization completed successfully!");
  process.exit(0);
}

auditAndCleanDatabase().catch((err) => {
  console.error("Database audit error:", err);
  process.exit(1);
});
