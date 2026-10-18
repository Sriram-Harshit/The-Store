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
    username: { type: String, unique: true, required: true, index: true },
    email: { type: String, unique: true, required: true, index: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    accountType: {
      type: String,
      enum: ["regular", "user", "seller", "admin", "superadmin"],
      default: "user",
      index: true,
    },
    // Seller Specific Onboarding & Approval Fields
    sellerStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: function () {
        return this.accountType === "seller" ? "pending" : "none";
      },
      index: true,
    },
    storeName: { type: String, default: "" },
    storeDescription: { type: String, default: "" },

    // Seller Document Verification & Onboarding Details
    sellerDocuments: {
      businessName: { type: String, default: "" },
      businessType: { type: String, default: "" }, // Sole Proprietorship, LLC, Corporation, Partnership
      storeCategory: { type: String, default: "" }, // Electronics, Fashion, Books, General
      taxId: { type: String, default: "" }, // GSTIN / EIN / VAT / PAN
      idType: { type: String, default: "" }, // Passport, National ID, Driver's License
      idNumber: { type: String, default: "" },
      documentUrl: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountHolderName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifscOrRouting: { type: String, default: "" },
      businessAddress: { type: String, default: "" },
      submittedAt: { type: Date },
    },

    // Administrative Rejection & Audit Details
    rejectionReason: { type: String, default: "" },
    rejectionMessage: { type: String, default: "" },
    rejectedAt: { type: Date },
    approvedAt: { type: Date },

    // Account Status Control
    status: {
      type: String,
      enum: ["active", "suspended", "banned"],
      default: "active",
      index: true,
    },
    addresses: [addressSchema],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ accountType: 1, sellerStatus: 1 });
userSchema.index({ status: 1 });

const User = mongoose.model("User", userSchema, "Users");

module.exports = User;
