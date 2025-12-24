const mongoose = require("mongoose");

const mongoUri = process.env.MONGO_URI;

const connectToDatabase = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectToDatabase;
