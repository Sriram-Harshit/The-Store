const mongoose = require("mongoose");
const dns = require("node:dns");

// Ensure MongoDB Atlas SRV records resolve smoothly on Windows environments
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore if system restricts custom DNS servers
}

const connectToDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    // Disable command buffering so queries don't hang for 10s if DB is not configured
    mongoose.set("bufferCommands", false);
    console.warn(
      "⚠️ MONGO_URI is not set in environment variables. Database connection skipped."
    );
    return;
  }
  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    mongoose.set("bufferCommands", false);
    console.error("Error connecting to MongoDB:", error.message);
  }
};

module.exports = connectToDatabase;
