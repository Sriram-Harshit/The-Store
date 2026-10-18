const http = require("http");
const dns = require("node:dns");

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {}

const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
require("dotenv").config();

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

// Helper for making HTTP requests
function request(options, body) {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch {
            parsed = data;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );
    req.on("error", (err) => resolve({ status: 500, error: err.message }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTestSuite() {
  console.log("==================================================================");
  console.log("🧪 COMPREHENSIVE ROUTE AUDIT FOR ALL USER TYPES ON THESTORE API");
  console.log("==================================================================\n");

  const results = [];
  function record(userType, route, method, expectedStatus, actualStatus, passCondition) {
    const passed = passCondition !== undefined ? passCondition : actualStatus === expectedStatus;
    const statusSign = passed ? "✅ PASS" : "❌ FAIL";
    results.push({ userType, route, method, expectedStatus, actualStatus, passed });
    console.log(`[${statusSign}] [${userType.padEnd(8)}] ${method.padEnd(6)} ${route.padEnd(35)} -> HTTP ${actualStatus} (Expected: ${expectedStatus})`);
  }

  // 1. Unauthenticated / Guest Tests
  console.log("\n--- 1. Testing Guest / Unauthenticated Visitor Routes ---");
  let res = await request({ path: "/", method: "GET" });
  record("Guest", "/", "GET", 200, res.status);

  res = await request({ path: "/api/product/products", method: "GET" });
  record("Guest", "/api/product/products", "GET", 200, res.status, res.status === 200 && Array.isArray(res.data) && res.data.length > 0);

  const testProduct = Array.isArray(res.data) ? res.data[0] : null;
  const testProductId = testProduct?._id;

  res = await request({ path: "/api/product/search?query=tv", method: "GET" });
  record("Guest", "/api/product/search", "GET", 200, res.status, res.status === 200 && res.data.results !== undefined);

  if (testProductId) {
    res = await request({ path: `/api/product/${testProductId}`, method: "GET" });
    record("Guest", `/api/product/:id`, "GET", 200, res.status, res.status === 200 && res.data?._id === testProductId);

    res = await request({ path: `/api/product/${testProductId}/review`, method: "POST" }, { userName: "Guest Reviewer", rating: 5, comment: "Route test review" });
    record("Guest", `/api/product/:id/review`, "POST", 201, res.status);
  }

  // Unauthenticated attempts on protected routes should return 401
  res = await request({ path: "/api/cart/getcart/user", method: "GET" });
  record("Guest", "/api/cart/getcart/user", "GET", 401, res.status);

  res = await request({ path: "/api/orders/getOrders", method: "GET" });
  record("Guest", "/api/orders/getOrders", "GET", 401, res.status);

  res = await request({ path: "/api/wishlist/getuserwishlist", method: "GET" });
  record("Guest", "/api/wishlist/getuserwishlist", "GET", 401, res.status);

  res = await request({ path: "/api/users/profile/profileDetails", method: "GET" });
  record("Guest", "/api/users/profile/profileDetails", "GET", 401, res.status);

  res = await request({ path: "/api/admin/overview", method: "GET" });
  record("Guest", "/api/admin/overview", "GET", 401, res.status);

  res = await request({ path: "/api/seller/dashboard", method: "GET" });
  record("Guest", "/api/seller/dashboard", "GET", 401, res.status);

  // Connect to MongoDB to find or generate valid user tokens for Customer, Seller, and Admin
  await mongoose.connect(process.env.MONGO_URI);
  const User = require("./models/userModel");

  // Find or create test Customer
  let customerUser = await User.findOne({ accountType: "user" });
  if (!customerUser) {
    customerUser = await User.findOne({});
  }
  const customerToken = jwt.sign(
    { userId: customerUser._id, username: customerUser.username, accountType: "user" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Find or create test Seller
  let sellerUser = await User.findOne({ accountType: "seller" });
  if (!sellerUser) {
    sellerUser = new User({
      firstName: "Test",
      lastName: "Seller",
      username: `testseller_${Date.now()}`,
      email: `seller_${Date.now()}@thestore.test`,
      phone: `999${Math.floor(1000000 + Math.random() * 9000000)}`,
      password: "hashedpassword",
      accountType: "seller",
      sellerStatus: "approved",
      storeName: "Test Merchant Store",
    });
    await sellerUser.save();
  }
  const sellerToken = jwt.sign(
    { userId: sellerUser._id, username: sellerUser.username, accountType: "seller" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Find or create test Admin
  let adminUser = await User.findOne({ accountType: "admin" });
  if (!adminUser) {
    adminUser = new User({
      firstName: "Platform",
      lastName: "Admin",
      username: `testadmin_${Date.now()}`,
      email: `admin_${Date.now()}@thestore.test`,
      phone: `888${Math.floor(1000000 + Math.random() * 9000000)}`,
      password: "hashedpassword",
      accountType: "admin",
    });
    await adminUser.save();
  }
  const adminToken = jwt.sign(
    { userId: adminUser._id, username: adminUser.username, accountType: "admin" },
    JWT_SECRET,
    { expiresIn: "1h" }
  );

  // 2. Customer Tests
  console.log("\n--- 2. Testing Customer (accountType: user) Routes ---");
  const custAuth = { headers: { Authorization: `Bearer ${customerToken}` } };

  res = await request({ path: "/api/users/profile/profileDetails", method: "GET", ...custAuth });
  record("Customer", "/api/users/profile/profileDetails", "GET", 200, res.status);

  res = await request({ path: "/api/cart/getcart/user", method: "GET", ...custAuth });
  record("Customer", "/api/cart/getcart/user", "GET", 200, res.status);

  if (testProductId) {
    res = await request({ path: "/api/cart/cartUpdate", method: "POST", ...custAuth }, { productId: testProductId, quantity: 2 });
    record("Customer", "/api/cart/cartUpdate", "POST", 200, res.status);

    res = await request({ path: "/api/wishlist/wishlistUpdate", method: "POST", ...custAuth }, { productId: testProductId });
    record("Customer", "/api/wishlist/wishlistUpdate", "POST", 200, res.status);
  }

  res = await request({ path: "/api/wishlist/getuserwishlist", method: "GET", ...custAuth });
  record("Customer", "/api/wishlist/getuserwishlist", "GET", 200, res.status);

  res = await request({ path: "/api/orders/getOrders", method: "GET", ...custAuth });
  record("Customer", "/api/orders/getOrders", "GET", 200, res.status);

  // Customer should be blocked (403 Forbidden) from Admin and Seller routes
  res = await request({ path: "/api/admin/overview", method: "GET", ...custAuth });
  record("Customer", "/api/admin/overview (Guard)", "GET", 403, res.status);

  res = await request({ path: "/api/admin/sellers", method: "GET", ...custAuth });
  record("Customer", "/api/admin/sellers (Guard)", "GET", 403, res.status);

  res = await request({ path: "/api/seller/dashboard", method: "GET", ...custAuth });
  record("Customer", "/api/seller/dashboard (Guard)", "GET", 403, res.status);

  // 3. Seller Tests
  console.log("\n--- 3. Testing Seller (accountType: seller) Routes ---");
  const sellerAuth = { headers: { Authorization: `Bearer ${sellerToken}` } };

  res = await request({ path: "/api/seller/dashboard", method: "GET", ...sellerAuth });
  record("Seller", "/api/seller/dashboard", "GET", 200, res.status);

  res = await request({ path: "/api/seller/products", method: "GET", ...sellerAuth });
  record("Seller", "/api/seller/products", "GET", 200, res.status);

  res = await request({ path: "/api/seller/orders", method: "GET", ...sellerAuth });
  record("Seller", "/api/seller/orders", "GET", 200, res.status);

  // Test Seller Document Inspection and Submission
  res = await request({ path: "/api/seller/documents", method: "GET", ...sellerAuth });
  record("Seller", "/api/seller/documents", "GET", 200, res.status);

  res = await request(
    { path: "/api/seller/documents", method: "POST", ...sellerAuth },
    {
      businessName: "Nexus Retailers Pvt Ltd",
      taxId: "GSTIN-33AABCN1234F1Z5",
      idType: "Government National ID",
      idNumber: "NID-9923841",
      bankName: "HDFC Commercial Bank",
      accountNumber: "50200012345678",
      ifscOrRouting: "HDFC0000123",
    }
  );
  record("Seller", "/api/seller/documents", "POST", 200, res.status);

  // Seller should be blocked from Admin routes and Customer Cart
  res = await request({ path: "/api/admin/overview", method: "GET", ...sellerAuth });
  record("Seller", "/api/admin/overview (Guard)", "GET", 403, res.status);

  res = await request({ path: "/api/cart/getcart/user", method: "GET", ...sellerAuth });
  record("Seller", "/api/cart/getcart/user (Guard)", "GET", 403, res.status);

  // 4. Admin Tests
  console.log("\n--- 4. Testing Admin (accountType: admin) Routes ---");
  const adminAuth = { headers: { Authorization: `Bearer ${adminToken}` } };

  res = await request({ path: "/api/admin/overview", method: "GET", ...adminAuth });
  record("Admin", "/api/admin/overview", "GET", 200, res.status);

  res = await request({ path: "/api/admin/sellers", method: "GET", ...adminAuth });
  record("Admin", "/api/admin/sellers", "GET", 200, res.status);

  // Admin Custom Rejection Directive Test
  res = await request(
    { path: `/api/admin/sellers/${sellerUser._id}/status`, method: "PATCH", ...adminAuth },
    {
      status: "rejected",
      rejectionReason: "Incomplete or unreadable tax documentation (GSTIN/EIN)",
      rejectionMessage: "Your GST certificate was blurred and the business name did not match the bank account. Please re-upload a clear PDF.",
    }
  );
  record("Admin", "/api/admin/sellers/:id/status (Reject)", "PATCH", 200, res.status);

  // Admin Restore Approval Test
  res = await request(
    { path: `/api/admin/sellers/${sellerUser._id}/status`, method: "PATCH", ...adminAuth },
    { status: "approved" }
  );
  record("Admin", "/api/admin/sellers/:id/status (Approve)", "PATCH", 200, res.status);

  res = await request({ path: "/api/admin/users", method: "GET", ...adminAuth });
  record("Admin", "/api/admin/users", "GET", 200, res.status);

  res = await request({ path: "/api/admin/products", method: "GET", ...adminAuth });
  record("Admin", "/api/admin/products", "GET", 200, res.status);

  if (testProductId) {
    res = await request(
      { path: `/api/admin/products/${testProductId}/status`, method: "PATCH", ...adminAuth },
      { status: "approved" }
    );
    record("Admin", "/api/admin/products/:id/status (Approve)", "PATCH", 200, res.status);
  }

  // Admin has system supervisor access to seller dashboard
  res = await request({ path: "/api/seller/dashboard", method: "GET", ...adminAuth });
  record("Admin", "/api/seller/dashboard (Supervisor)", "GET", 200, res.status);

  // Admin cannot access customer personal shopping cart
  res = await request({ path: "/api/cart/getcart/user", method: "GET", ...adminAuth });
  record("Admin", "/api/cart/getcart/user (Guard)", "GET", 403, res.status);

  console.log("\n==================================================================");
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;
  console.log(`TOTAL ROUTES TESTED: ${total}`);
  console.log(`PASSED: ${passedCount}`);
  console.log(`FAILED: ${failedCount}`);
  console.log("==================================================================");

  process.exit(failedCount === 0 ? 0 : 1);
}

runTestSuite().catch((err) => {
  console.error("Test Suite crashed:", err);
  process.exit(1);
});
