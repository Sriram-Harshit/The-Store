const mongoose = require("mongoose");
const dns = require("node:dns");

// Ensure MongoDB Atlas SRV records resolve smoothly on Windows environments
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch {
  // Ignore if system restricts custom DNS servers
}

// Global cached connection for serverless execution environments (Vercel, AWS Lambda)
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectToDatabase = async () => {
  // If already connected, return active connection immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.warn("⚠️ MONGO_URI is not set in environment variables.");
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true, // Keep default command buffering so queries await initial handshake
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    };

    cached.promise = mongoose
      .connect(mongoUri, opts)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB");
        return mongooseInstance;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("Error connecting to MongoDB:", error.message);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

module.exports = connectToDatabase;
