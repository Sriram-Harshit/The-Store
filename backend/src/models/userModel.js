const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  apartment: { type: String },
  street: { type: String },
  city: { type: String },
  state: { type: String },
  postalcode: { type: String },
  country: { type: String },
});

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["regular", "admin", "seller", "superadmin"],
      default: "regular",
    },
    addresses: [addressSchema],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

userSchema.pre("save", function (next) {
  if (!this.isNew) {
    this.createdAt = this.createdAt || new Date();
  }
  next();
});

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;
