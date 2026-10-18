require("dotenv").config({ path: "../.env" });
require("dotenv").config();
const dns = require("node:dns");

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore
}

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Cart = require("../models/cartsModel");
const Wishlist = require("../models/wishlistModel");

const SAMPLE_PRODUCTS = require("./catalogData");

async function seedDatabase() {
  console.log("==================================================================");
  console.log("🌱 STARTING FRESH DATABASE WIPE & RESEED WITH NEW SCHEMAS");
  console.log("==================================================================");

  const mongoURI =
    process.env.MONGO_URI ||
    "mongodb+srv://sriram_database:sriram123@thestore.y8j2bsp.mongodb.net/?retryWrites=true&w=majority&appName=TheStore";

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(mongoURI);
  console.log("Connected successfully to MongoDB.");

  // 1. CLEAR ALL PREVIOUS DATA ACCORDING TO USER INSTRUCTION
  console.log("\n🧹 1. Cleaning and removing all previous data across all collections...");
  await Promise.all([
    User.deleteMany({}),
    Product.deleteMany({}),
    Order.deleteMany({}),
    Cart.deleteMany({}),
    Wishlist.deleteMany({}),
  ]);
  console.log("Database wiped clean: Users, Products, Orders, Carts, Wishlists are now 0.");

  // 2. PREPARE PASSWORDS
  const adminPassword = await bcrypt.hash("admin123", 10);
  const sellerPassword = await bcrypt.hash("seller123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // 3. SEED TWO DEDICATED ADMINISTRATORS
  console.log("\n👥 2. Seeding Two Dedicated Administrators...");
  const admin1 = await User.create({
    firstName: "System",
    lastName: "Administrator",
    username: "superadmin",
    email: "admin@thestore.com",
    phone: "+1-800-555-0100",
    password: adminPassword,
    accountType: "admin",
    sellerStatus: "none",
    status: "active",
  });

  const admin2 = await User.create({
    firstName: "Operations",
    lastName: "Director",
    username: "opsadmin",
    email: "opsadmin@thestore.com",
    phone: "+1-800-555-0101",
    password: adminPassword,
    accountType: "admin",
    sellerStatus: "none",
    status: "active",
  });
  console.log(`- Created Super Admin: ${admin1.email} (Username: ${admin1.username})`);
  console.log(`- Created Ops Admin:   ${admin2.email} (Username: ${admin2.username})`);

  // 4. SEED SELLERS ACROSS ALL WORKFLOW STATUSES (Approved, Pending, Rejected)
  console.log("\n🏪 3. Seeding Merchants with Seller Documents & Compliance Audits...");

  // Approved Seller 1: Apex Electronics
  const sellerApex = await User.create({
    firstName: "Apex",
    lastName: "Electronics",
    username: "apextech",
    email: "apextech@thestore.com",
    phone: "+1-800-555-0111",
    password: sellerPassword,
    accountType: "seller",
    sellerStatus: "approved",
    storeName: "Apex Tech & Laptops",
    storeDescription: "Premier authorized distributor of high-performance laptops, workstations, and computing hardware.",
    status: "active",
    sellerDocuments: {
      businessName: "Apex Tech Solutions Inc.",
      businessType: "Corporation",
      storeCategory: "Electronics",
      taxId: "EIN-47-8921045",
      idType: "Passport",
      idNumber: "P84920194",
      documentUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600",
      bankName: "JPMorgan Chase",
      accountHolderName: "Apex Tech Solutions Inc.",
      accountNumber: "987654321012",
      ifscOrRouting: "021000021",
      businessAddress: "100 Innovation Way, Suite 400, Austin, TX 78701",
      submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    approvedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
  });

  // Approved Seller 2: Vogue Apparel
  const sellerVogue = await User.create({
    firstName: "Vogue",
    lastName: "Apparel",
    username: "voguetrends",
    email: "vogue@thestore.com",
    phone: "+1-800-555-0222",
    password: sellerPassword,
    accountType: "seller",
    sellerStatus: "approved",
    storeName: "Vogue Trends & Lifestyle",
    storeDescription: "Curated sustainable fashion, designer streetwear, and premium lifestyle essentials.",
    status: "active",
    sellerDocuments: {
      businessName: "Vogue Global Apparel LLC",
      businessType: "LLC",
      storeCategory: "Clothing",
      taxId: "EIN-12-3849102",
      idType: "Driver's License",
      idNumber: "DL-9382104",
      documentUrl: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600",
      bankName: "Bank of America",
      accountHolderName: "Vogue Global Apparel LLC",
      accountNumber: "123456789098",
      ifscOrRouting: "111000025",
      businessAddress: "450 Fashion Ave, New York, NY 10018",
      submittedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  });

  // Approved Seller 3: Aura Sound Labs
  const sellerAura = await User.create({
    firstName: "Aura",
    lastName: "Acoustics",
    username: "aurasound",
    email: "aura@thestore.com",
    phone: "+1-800-555-0333",
    password: sellerPassword,
    accountType: "seller",
    sellerStatus: "approved",
    storeName: "Aura Sound Labs",
    storeDescription: "Audiophile-grade studio monitors, wireless noise-cancelling headphones, and sound systems.",
    status: "active",
    sellerDocuments: {
      businessName: "Aura Audio Works Ltd.",
      businessType: "Partnership",
      storeCategory: "Electronics",
      taxId: "EIN-98-1029384",
      idType: "National ID",
      idNumber: "NID-4829103",
      documentUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600",
      bankName: "Wells Fargo",
      accountHolderName: "Aura Audio Works Ltd.",
      accountNumber: "554433221100",
      ifscOrRouting: "121000247",
      businessAddress: "780 Audio Blvd, Seattle, WA 98101",
      submittedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    approvedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  });

  // Approved Seller 4: Nordic Living & Decor
  const sellerNordic = await User.create({
    firstName: "Nordic",
    lastName: "Living",
    username: "nordicliving",
    email: "nordic@thestore.com",
    phone: "+1-800-555-0444",
    password: sellerPassword,
    accountType: "seller",
    sellerStatus: "approved",
    storeName: "Nordic Living & Decor",
    storeDescription: "Minimalist Scandinavian home decor, ergonomic study furniture, and artisan ceramics.",
    status: "active",
    sellerDocuments: {
      businessName: "Nordic Living Crafts Co.",
      businessType: "Sole Proprietorship",
      storeCategory: "Home",
      taxId: "GSTIN-07AAAAA0000A1Z5",
      idType: "Passport",
      idNumber: "N82910471",
      documentUrl: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600",
      bankName: "Citibank",
      accountHolderName: "Nordic Living Crafts Co.",
      accountNumber: "443322119988",
      ifscOrRouting: "021000089",
      businessAddress: "22 Design District, Portland, OR 97201",
      submittedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    approvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  });

  // Approved Seller 5: Peak Velocity Sports
  const sellerPeak = await User.create({
    firstName: "Marcus",
    lastName: "Sterling",
    username: "peaksports",
    email: "sports@thestore.com",
    phone: "+1-800-555-0441",
    password: sellerPassword,
    accountType: "seller",
    sellerStatus: "approved",
    storeName: "Peak Velocity Athletics",
    storeDescription: "High-performance fitness gear, weightlifting equipment, and outdoor hydration.",
    status: "active",
    sellerDocuments: {
      businessName: "Peak Velocity Sports Group Inc.",
      businessType: "Corporation",
      storeCategory: "Sports & Fitness",
      taxId: "EIN-88-2910482",
      idType: "Driver's License",
      idNumber: "DL-P8291039",
      documentUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600",
      bankName: "Capital One",
      accountHolderName: "Peak Velocity Sports Group Inc.",
      accountNumber: "665544332211",
      ifscOrRouting: "051405515",
      businessAddress: "500 Athletics Parkway, Denver, CO 80202",
      submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    },
    approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  });

  // Approved Seller 6: Glow & Radiance Organics
  const sellerGlow = await User.create({
    firstName: "Elena",
    lastName: "Rostova",
    username: "glowbeauty",
    email: "beauty@thestore.com",
    phone: "+1-800-555-0552",
    password: sellerPassword,
    accountType: "seller",
    sellerStatus: "approved",
    storeName: "Glow & Radiance Organics",
    storeDescription: "Clean clinical skincare, artisan fragrances, and sonic personal grooming essentials.",
    status: "active",
    sellerDocuments: {
      businessName: "Glow & Radiance Botanicals LLC",
      businessType: "LLC",
      storeCategory: "Beauty & Personal Care",
      taxId: "EIN-33-8472910",
      idType: "Passport",
      idNumber: "P38194829",
      documentUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
      bankName: "Morgan Stanley Private Bank",
      accountHolderName: "Glow & Radiance Botanicals LLC",
      accountNumber: "889900112233",
      ifscOrRouting: "026013673",
      businessAddress: "120 Beauty Boulevard, San Francisco, CA 94107",
      submittedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    approvedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  });

  // Pending Seller: EcoGreen Organics (Ready for Admin Approval testing)
  const sellerEco = await User.create({
    firstName: "Chloe",
    lastName: "Greenwood",
    username: "ecogreen",
    email: "eco@thestore.com",
    phone: "+1-800-555-0661",
    password: sellerPassword,
    accountType: "seller",
    sellerStatus: "pending",
    storeName: "EcoGreen Organics",
    storeDescription: "Zero-waste botanical home essentials and sustainable fair-trade lifestyle goods.",
    status: "active",
    sellerDocuments: {
      businessName: "EcoGreen Organics Collective",
      businessType: "Sole Proprietorship",
      storeCategory: "Home & Living",
      taxId: "EIN-77-9201481",
      idType: "Passport",
      idNumber: "P91029482",
      documentUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600",
      bankName: "First Republic Bank",
      accountHolderName: "EcoGreen Organics Collective",
      accountNumber: "334455667788",
      ifscOrRouting: "121000358",
      businessAddress: "14 Eco Way, Boulder, CO 80301",
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  // Rejected Seller: Speedy DropShip (Ready for Admin Rejection & Notice testing)
  const sellerRejected = await User.create({
    firstName: "Speedy",
    lastName: "DropShip",
    username: "speedydropship",
    email: "dropship@thestore.com",
    phone: "+1-800-555-0555",
    password: sellerPassword,
    accountType: "seller",
    sellerStatus: "rejected",
    storeName: "Speedy DropShip Central",
    storeDescription: "Third-party generic goods and drop-shipped merchandise.",
    status: "active",
    sellerDocuments: {
      businessName: "Quick Drop Enterprise",
      businessType: "Sole Proprietorship",
      storeCategory: "General Multi-Category Retail",
      taxId: "INVALID-TAX-ID",
      idType: "National ID",
      idNumber: "TEMP-00129",
      documentUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
      bankName: "Generic NeoBank",
      accountHolderName: "Quick Drop",
      accountNumber: "112233445566",
      ifscOrRouting: "000000000",
      businessAddress: "PO Box 999, Unknown City",
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    rejectionReason: "Incomplete or unreadable tax documentation (GSTIN/EIN)",
    rejectionMessage:
      "Your submitted tax identification certificate (EIN/GSTIN) could not be verified with official tax authorities. Please re-upload a government-verified certificate and valid proof of business registration.",
    rejectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
  });

  console.log(`- Created Approved Seller 1: ${sellerApex.email} (${sellerApex.storeName})`);
  console.log(`- Created Approved Seller 2: ${sellerVogue.email} (${sellerVogue.storeName})`);
  console.log(`- Created Approved Seller 3: ${sellerAura.email} (${sellerAura.storeName})`);
  console.log(`- Created Approved Seller 4: ${sellerNordic.email} (${sellerNordic.storeName})`);
  console.log(`- Created Approved Seller 5: ${sellerPeak.email} (${sellerPeak.storeName})`);
  console.log(`- Created Approved Seller 6: ${sellerGlow.email} (${sellerGlow.storeName})`);
  console.log(`- Created Pending Seller:    ${sellerEco.email} (${sellerEco.storeName})`);
  console.log(`- Created Rejected Seller:   ${sellerRejected.email} (${sellerRejected.storeName})`);

  // 5. SEED REGULAR CONSUMER CUSTOMERS
  console.log("\n🛍️ 4. Seeding Customer Accounts...");
  const customer1 = await User.create({
    firstName: "John",
    lastName: "Doe",
    username: "john_doe",
    email: "customer@thestore.com",
    phone: "+1-800-555-0201",
    password: userPassword,
    accountType: "user",
    sellerStatus: "none",
    status: "active",
    addresses: [
      {
        apartment: "Apt 4B",
        street: "742 Evergreen Terrace",
        city: "Austin",
        state: "Texas",
        postalcode: "78701",
        country: "USA",
      },
    ],
  });

  const customer2 = await User.create({
    firstName: "Sarah",
    lastName: "Connor",
    username: "sarah_c",
    email: "sarah@thestore.com",
    phone: "+1-800-555-0202",
    password: userPassword,
    accountType: "user",
    sellerStatus: "none",
    status: "active",
    addresses: [
      {
        apartment: "Suite 12",
        street: "1200 Sunset Blvd",
        city: "Los Angeles",
        state: "California",
        postalcode: "90028",
        country: "USA",
      },
    ],
  });

  const customer3 = await User.create({
    firstName: "David",
    lastName: "Miller",
    username: "david_m",
    email: "david@thestore.com",
    phone: "+1-800-555-0203",
    password: userPassword,
    accountType: "user",
    sellerStatus: "none",
    status: "active",
  });

  const customer4 = await User.create({
    firstName: "Emily",
    lastName: "Watson",
    username: "emily_w",
    email: "emily@thestore.com",
    phone: "+1-800-555-0204",
    password: userPassword,
    accountType: "user",
    sellerStatus: "none",
    status: "active",
  });
  console.log(`- Created 4 Active Customers: ${customer1.email}, ${customer2.email}, ${customer3.email}, ${customer4.email}`);

  // 6. SEED PRODUCTS TIED TO RELEVANT APPROVED SELLERS
  console.log("\n📦 5. Seeding Product Catalog with Technical Specs & HD Visuals...");
  const createdProducts = [];
  for (const item of SAMPLE_PRODUCTS) {
    let sellerId = sellerApex._id;
    if (item.sellerName.includes("Vogue")) {
      sellerId = sellerVogue._id;
    } else if (item.sellerName.includes("Aura")) {
      sellerId = sellerAura._id;
    } else if (item.sellerName.includes("Nordic")) {
      sellerId = sellerNordic._id;
    } else if (item.sellerName.includes("Peak")) {
      sellerId = sellerPeak._id;
    } else if (item.sellerName.includes("Glow")) {
      sellerId = sellerGlow._id;
    }

    const prod = await Product.create({
      ...item,
      sellerId,
    });
    createdProducts.push(prod);
  }
  console.log(`- Successfully seeded ${createdProducts.length} high-spec products across all store categories.`);

  // 7. SEED ORDERS FOR COMPREHENSIVE GMV, ORDER COUNTS, PIPELINE & RECENT ORDERS TABLE
  console.log("\n💳 6. Seeding Platform Orders across all Fulfillment Pipeline Stages...");
  const orderData = [
    // Delivered Order 1 (Customer 1)
    {
      userId: customer1._id,
      items: [
        { productId: createdProducts[0]._id, quantity: 1, price: createdProducts[0].price }, // MacBook Pro
      ],
      totalPrice: createdProducts[0].price,
      status: "Delivered",
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
    // Delivered Order 2 (Customer 2)
    {
      userId: customer2._id,
      items: [
        { productId: createdProducts[5]._id, quantity: 1, price: createdProducts[5].price }, // iPhone 15 Pro Max
        { productId: createdProducts[6]._id, quantity: 1, price: createdProducts[6].price }, // Sony XM5
      ],
      totalPrice: createdProducts[5].price + createdProducts[6].price,
      status: "Delivered",
      createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    },
    // Delivered Order 3 (Customer 3)
    {
      userId: customer3._id,
      items: [
        { productId: createdProducts[9]._id, quantity: 1, price: createdProducts[9].price }, // Italian Wool Overcoat
      ],
      totalPrice: createdProducts[9].price,
      status: "Delivered",
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    },
    // Delivered Order 4 (Customer 4)
    {
      userId: customer4._id,
      items: [
        { productId: createdProducts[14]._id, quantity: 1, price: createdProducts[14].price }, // Ergonomic Chair
      ],
      totalPrice: createdProducts[14].price,
      status: "Delivered",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    },
    // Shipped Order 1 (Customer 1)
    {
      userId: customer1._id,
      items: [
        { productId: createdProducts[10]._id, quantity: 2, price: createdProducts[10].price }, // French Terry Hoodie x 2
      ],
      totalPrice: createdProducts[10].price * 2,
      status: "Shipped",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    // Shipped Order 2 (Customer 2)
    {
      userId: customer2._id,
      items: [
        { productId: createdProducts[8]._id, quantity: 1, price: createdProducts[8].price }, // LG 32" OLED Monitor
      ],
      totalPrice: createdProducts[8].price,
      status: "Shipped",
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
    },
    // Pending Order 1 (Customer 3)
    {
      userId: customer3._id,
      items: [
        { productId: createdProducts[15]._id, quantity: 1, price: createdProducts[15].price }, // Clean Architecture
        { productId: createdProducts[16]._id, quantity: 1, price: createdProducts[16].price }, // Designing Data-Intensive
      ],
      totalPrice: createdProducts[15].price + createdProducts[16].price,
      status: "Pending",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
    // Pending Order 2 (Customer 4)
    {
      userId: customer4._id,
      items: [
        { productId: createdProducts[7]._id, quantity: 1, price: createdProducts[7].price }, // Aura Studio Monitors
      ],
      totalPrice: createdProducts[7].price,
      status: "Pending",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    // Cancelled Order (Customer 1)
    {
      userId: customer1._id,
      items: [
        { productId: createdProducts[4]._id, quantity: 1, price: createdProducts[4].price }, // HP Envy x360
      ],
      totalPrice: createdProducts[4].price,
      status: "Cancelled",
      createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    },
    // Delivered Order 5: Sports & Fitness (Customer 2)
    {
      userId: customer2._id,
      items: [
        { productId: createdProducts[27]._id, quantity: 1, price: createdProducts[27].price }, // Quick-Adjust Dumbbells
        { productId: createdProducts[30]._id, quantity: 2, price: createdProducts[30].price }, // Hydro Flask Bottle x 2
      ],
      totalPrice: createdProducts[27].price + createdProducts[30].price * 2,
      status: "Delivered",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    // Shipped Order 3: Beauty & Care (Customer 3)
    {
      userId: customer3._id,
      items: [
        { productId: createdProducts[32]._id, quantity: 1, price: createdProducts[32].price }, // Vitamin C Glow Serum
        { productId: createdProducts[33]._id, quantity: 1, price: createdProducts[33].price }, // Ceramide Barrier Cream
      ],
      totalPrice: createdProducts[32].price + createdProducts[33].price,
      status: "Shipped",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    // Pending Order 3: Toys & Gaming (Customer 4)
    {
      userId: customer4._id,
      items: [
        { productId: createdProducts[36]._id, quantity: 1, price: createdProducts[36].price }, // DualSense Edge Controller
      ],
      totalPrice: createdProducts[36].price,
      status: "Pending",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ];

  for (const ord of orderData) {
    await Order.create(ord);
  }
  console.log(`- Seeded ${orderData.length} Orders across Delivered, Shipped, Pending, and Cancelled statuses.`);

  // 8. SEED CARTS & WISHLISTS FOR IMMEDIATE CUSTOMER TESTING
  console.log("\n🛒 7. Seeding Active Cart & Wishlist for customer@thestore.com...");
  await Cart.create({
    userId: customer1._id,
    items: [
      { productId: createdProducts[1]._id, quantity: 1 }, // Dell XPS 15
      { productId: createdProducts[12]._id, quantity: 1 }, // Supima Tees 3-pack
      { productId: createdProducts[28]._id, quantity: 1 }, // Natural Rubber Yoga Mat
    ],
  });

  await Wishlist.create({
    userId: customer1._id,
    items: [
      createdProducts[3]._id, // ASUS ROG Zephyrus
      createdProducts[13]._id, // Nordic Ambient Lamp
      createdProducts[34]._id, // French Bergamot Perfume
    ],
  });
  console.log("- Cart & Wishlist populated for customer@thestore.com.");

  console.log("\n==================================================================");
  console.log("🎉 DATABASE RE-SEED COMPLETED SUCCESSFULLY!");
  console.log("==================================================================");
  console.log("Summary of Seeded Credentials:");
  console.log("  Super Admin:  admin@thestore.com      / admin123");
  console.log("  Ops Admin:    opsadmin@thestore.com   / admin123");
  console.log("  Approved 1:   apextech@thestore.com   / seller123 (Apex Tech & Laptops - Electronics)");
  console.log("  Approved 2:   vogue@thestore.com      / seller123 (Vogue Trends & Lifestyle - Clothing)");
  console.log("  Approved 3:   aura@thestore.com       / seller123 (Aura Sound Labs - Audio)");
  console.log("  Approved 4:   nordic@thestore.com     / seller123 (Nordic Living & Decor - Home)");
  console.log("  Approved 5:   sports@thestore.com     / seller123 (Peak Velocity Athletics - Sports)");
  console.log("  Approved 6:   beauty@thestore.com     / seller123 (Glow & Radiance Organics - Beauty)");
  console.log("  Pending:      eco@thestore.com        / seller123 (EcoGreen Organics - Home/Living)");
  console.log("  Rejected:     dropship@thestore.com   / seller123 (Speedy DropShip - General Retail)");
  console.log("  Customer:     customer@thestore.com   / user123");
  console.log("==================================================================\n");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
