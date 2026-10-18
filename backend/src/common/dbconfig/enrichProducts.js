require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const dns = require("node:dns");

try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore
}

const mongoose = require("mongoose");
const Product = require("../models/productModel");

async function enrichDatabase() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB!");

  const products = await Product.find();
  console.log(`Auditing ${products.length} products...`);

  let updatedCount = 0;

  for (const p of products) {
    const name = p.name || "";
    const lowerName = name.toLowerCase();
    const type = p.type || "Electronics";
    let needsUpdate = false;

    // 1. Check & Populate Specs
    let currentSpecs = {};
    if (p.specs) {
      const raw = p.toObject ? p.toObject().specs : p.specs;
      if (raw && typeof raw === "object") {
        for (const [k, v] of Object.entries(raw)) {
          if (v) currentSpecs[k] = v;
        }
      }
    }

    // SONY TV or TVs / Displays
    if (lowerName.includes("tv") || lowerName.includes("television") || lowerName.includes("display") || lowerName.includes("monitor")) {
      currentSpecs = {
        ...currentSpecs,
        screenSize: currentSpecs.screenSize || (lowerName.includes("50") ? '50 Inches (126 cm)' : lowerName.includes("65") ? '65 Inches (164 cm)' : lowerName.includes("55") ? '55 Inches (139 cm)' : '43 Inches (108 cm)'),
        display: currentSpecs.display || (lowerName.includes("oled") ? "OLED Self-Illuminating Panel, Infinite Contrast" : lowerName.includes("4k") ? "4K Ultra HD (3840 x 2160) Triluminos Pro" : "Full HD (1920 x 1080) Direct LED Backlight"),
        resolution: currentSpecs.resolution || (lowerName.includes("4k") ? "3840 x 2160 (4K UHD)" : "1920 x 1080 (Full HD 1080p)"),
        refreshRate: currentSpecs.refreshRate || (lowerName.includes("120") ? "120Hz Native, VRR Supported" : "60Hz Native with Motionflow XR 200"),
        soundOutput: currentSpecs.soundOutput || "20W Stereo Speakers with Dolby Audio, Clear Phase & S-Force Front Surround",
        smartFeatures: currentSpecs.smartFeatures || "Smart TV with Built-in Wi-Fi, Google Assistant, Netflix, Prime Video, YouTube, Screen Mirroring",
        ports: currentSpecs.ports || "2x HDMI (1 with ARC), 2x USB 2.0, 1x Optical Digital Audio Out, 1x Ethernet LAN, 3.5mm Headphone Jack",
        connectivity: currentSpecs.connectivity || "Wi-Fi 802.11 b/g/n (2.4GHz), Bluetooth 5.0, Screen Mirroring",
        dimensions: currentSpecs.dimensions || "112.5 x 65.4 x 6.8 cm (Without Stand), 11.4 kg",
        weight: currentSpecs.weight || "11.4 kg",
      };

      if (!p.highlights || !p.highlights.length) {
        p.highlights = [
          "X-Reality PRO Picture Engine analyzes and cleans up images for pristine clarity",
          "ClearAudio+ sound system fine-tunes audio for a richer, more immersive listening experience",
          "Smart TV functionality with quick access to Netflix, YouTube, and smartphone mirroring",
          "X-Protection PRO defends against lightning, voltage fluctuations, humidity, and dust",
        ];
        needsUpdate = true;
      }

      if (!p.whatsInTheBox || !p.whatsInTheBox.length) {
        p.whatsInTheBox = [
          `1x ${name} Unit`,
          "1x Smart Remote Controller",
          "2x AAA Batteries",
          "1x Table-Top Stand & Screws",
          "1x AC Power Adapter & Cord",
          "1x Quick Setup Guide & 2-Year Warranty Card",
        ];
        needsUpdate = true;
      }

      if (!p.sellerName || p.sellerName === "Verified Store Merchant") {
        p.sellerName = "Sony Authorized Flagship Store";
        needsUpdate = true;
      }
      if (!p.warranty || p.warranty === "1 Year Standard Warranty") {
        p.warranty = "2 Years Comprehensive Brand Warranty with Onsite Technician Support";
        needsUpdate = true;
      }
      needsUpdate = true;
    }
    // Laptops / Computers
    else if (lowerName.includes("laptop") || lowerName.includes("macbook") || lowerName.includes("thinkpad") || lowerName.includes("zenbook") || lowerName.includes("xps")) {
      if (!currentSpecs.processor) {
        currentSpecs.processor = lowerName.includes("macbook") ? "Apple M3 Pro / Max (12-core CPU)" : lowerName.includes("i9") ? "Intel Core i9-13900H (14 Cores, 5.4GHz)" : lowerName.includes("ryzen") ? "AMD Ryzen 7 7730U (8 Cores, 4.5GHz)" : "Intel Core i7 13th Gen (10 Cores, 4.8GHz)";
        currentSpecs.ram = "16GB Dual-Channel High-Speed Memory";
        currentSpecs.storage = "512GB PCIe Gen4 NVMe M.2 SSD";
        currentSpecs.display = "15.6\" FHD (1920x1080) IPS 100% sRGB Anti-Glare";
        currentSpecs.graphics = lowerName.includes("gaming") ? "NVIDIA GeForce RTX 4070 8GB GDDR6" : "Intel Iris Xe Graphics";
        currentSpecs.battery = "Up to 12 Hours Battery with 65W Fast Charging";
        currentSpecs.os = lowerName.includes("macbook") ? "macOS Sonoma" : "Windows 11 Home 64-bit";
        needsUpdate = true;
      }
      if (!p.highlights || !p.highlights.length) {
        p.highlights = [
          "Blazing-fast multicore architecture tailored for programming, creative workloads, and multitasking",
          "Vibrant anti-glare display with micro-edge bezels and TÜV Rheinland low blue light certification",
          "All-day battery life with rapid charge powering up to 50% in just 30 minutes",
          "Precision-engineered aluminum alloy chassis with backlit ergonomic keyboard",
        ];
        needsUpdate = true;
      }
      if (!p.whatsInTheBox || !p.whatsInTheBox.length) {
        p.whatsInTheBox = [`1x ${name}`, "1x 65W/100W USB-C Fast Charger", "1x Power Cable", "1x User Manual & Warranty Card"];
        needsUpdate = true;
      }
      if (!p.sellerName || p.sellerName === "Verified Store Merchant") {
        p.sellerName = "Apex Tech & Laptops";
        needsUpdate = true;
      }
    }
    // Smartphones / Audio / Electronics
    else if (type === "Electronics") {
      if (!currentSpecs.display && !currentSpecs.driver) {
        if (lowerName.includes("headphone") || lowerName.includes("audio") || lowerName.includes("earbuds") || lowerName.includes("speaker")) {
          currentSpecs.driver = "40mm Neodymium Hi-Res Dynamic Drivers";
          currentSpecs.battery = "Up to 30 Hours Continuous Playback with ANC Enabled";
          currentSpecs.connectivity = "Bluetooth 5.3 with Multi-Point Device Pairing & 3.5mm AUX";
          currentSpecs.weight = "250 grams";
        } else {
          currentSpecs.display = "6.67\" FHD+ AMOLED Display (120Hz Refresh Rate, 1200 Nits)";
          currentSpecs.processor = "Qualcomm Snapdragon Octa-Core Processor";
          currentSpecs.ram = "8GB LPDDR5 RAM";
          currentSpecs.storage = "128GB / 256GB High-Speed Storage";
          currentSpecs.battery = "5000 mAh All-Day Battery with 67W Turbo Charge";
        }
        needsUpdate = true;
      }
      if (!p.highlights || !p.highlights.length) {
        p.highlights = [
          "Premium audio/visual performance tuned with studio-grade fidelity",
          "Engineered with ergonomic lightweight comfort for extended daily use",
          "Fast-charging capabilities ensuring minimal downtime and maximum endurance",
        ];
        needsUpdate = true;
      }
      if (!p.whatsInTheBox || !p.whatsInTheBox.length) {
        p.whatsInTheBox = [`1x ${name}`, "1x Charging Cable", "1x Quick Start Guide", "1x Warranty Documentation"];
        needsUpdate = true;
      }
    }
    // Clothing / Apparel
    else if (type === "Clothing") {
      if (!currentSpecs.material) {
        currentSpecs.material = "100% Combed Breathable Organic Cotton";
        currentSpecs.fit = "Modern Regular Fit with Reinforced Seams";
        currentSpecs.gender = lowerName.includes("women") ? "Women" : lowerName.includes("men") ? "Men" : "Unisex";
        currentSpecs.occasion = "Casual, Daily Wear & Outdoor";
        currentSpecs.season = "All Seasons";
        needsUpdate = true;
      }
      if (!p.highlights || !p.highlights.length) {
        p.highlights = [
          "Super-combed pure organic cotton yarn for ultra-soft hand feel",
          "Color-fast bio-wash treatment prevents fading and shrinkage through repeated washes",
          "Reinforced ribbed collar and dual-stitched hems ensure long-lasting durability",
        ];
        needsUpdate = true;
      }
      if (!p.whatsInTheBox || !p.whatsInTheBox.length) {
        p.whatsInTheBox = [`1x ${name} (Eco-friendly sealed packaging)`];
        needsUpdate = true;
      }
      if (!p.sellerName || p.sellerName === "Verified Store Merchant") {
        p.sellerName = "Urban Stitch & Fashion House";
        needsUpdate = true;
      }
    }
    // Books
    else if (type === "Books") {
      if (!currentSpecs.author) {
        currentSpecs.author = "Distinguished Subject Specialists & Authors";
        currentSpecs.publisher = "Penguin Random House / O'Reilly Media";
        currentSpecs.pages = 384;
        currentSpecs.genre = "Educational & Professional Reference";
        currentSpecs.language = "English";
        needsUpdate = true;
      }
      if (!p.highlights || !p.highlights.length) {
        p.highlights = [
          "Comprehensive chapter-by-chapter breakdowns with practical real-world exercises",
          "Clear, engaging prose formatted with diagrams, callouts, and key takeaways",
          "Printed on archival acid-free paper with premium binding",
        ];
        needsUpdate = true;
      }
      if (!p.whatsInTheBox || !p.whatsInTheBox.length) {
        p.whatsInTheBox = [`1x ${name} (Hardcover / Paperback Book with Bookmark)`];
        needsUpdate = true;
      }
      if (!p.sellerName || p.sellerName === "Verified Store Merchant") {
        p.sellerName = "Beacon Book Pavilion";
        needsUpdate = true;
      }
    }
    // Home / Toys / Other Categories
    else {
      if (!currentSpecs.material && !currentSpecs.dimensions) {
        currentSpecs.material = type === "Home" ? "Premium Solid Wood & Rust-Resistant Alloy" : "BPA-Free Non-Toxic High-Durability ABS";
        currentSpecs.dimensions = "Standard Ergonomic Compact Dimensions";
        currentSpecs.weight = "Lightweight & Sturdy";
        needsUpdate = true;
      }
      if (!p.highlights || !p.highlights.length) {
        p.highlights = [
          "Engineered for daily resilience and effortless maintenance",
          "Crafted from certified eco-friendly, non-toxic materials",
          "Backed by comprehensive quality inspection and satisfaction guarantee",
        ];
        needsUpdate = true;
      }
      if (!p.whatsInTheBox || !p.whatsInTheBox.length) {
        p.whatsInTheBox = [`1x ${name} Unit`, "1x Care & Setup Guide"];
        needsUpdate = true;
      }
    }

    // Ensure reviews are populated with verified dates
    if (!p.reviews || p.reviews.length < 3) {
      p.reviews = [
        {
          userName: "Alex R. (Verified Buyer)",
          comment: "Exceeded my expectations! Build quality is stellar and setup took under 5 minutes.",
          rating: 5,
          createdAt: new Date(Date.now() - 14 * 86400000),
        },
        {
          userName: "Jordan M. (Verified Buyer)",
          comment: "Great value for the price. Performs exactly as advertised in daily use.",
          rating: 5,
          createdAt: new Date(Date.now() - 32 * 86400000),
        },
        {
          userName: "Devon K. (Verified Buyer)",
          comment: "Very pleased with the packaging, fast 2-day delivery, and warranty support.",
          rating: 4,
          createdAt: new Date(Date.now() - 60 * 86400000),
        },
      ];
      needsUpdate = true;
    }

    p.specs = currentSpecs;

    // Direct MongoDB $set guarantees full persistence without schema filtering issues
    await Product.updateOne(
      { _id: p._id },
      {
        $set: {
          specs: currentSpecs,
          highlights: p.highlights,
          whatsInTheBox: p.whatsInTheBox,
          sellerName: p.sellerName,
          warranty: p.warranty,
          reviews: p.reviews,
        },
      }
    );
    updatedCount++;
  }

  console.log(`Successfully updated and enriched ${updatedCount} products in MongoDB!`);
  process.exit(0);
}

enrichDatabase().catch((err) => {
  console.error("Enrichment failed:", err);
  process.exit(1);
});
