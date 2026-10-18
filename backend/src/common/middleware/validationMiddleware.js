const mongoose = require("mongoose");

// Helper: check valid MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Middleware: Validate ID parameter in route
const validateIdParam = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Validation Error: Parameter "${paramName}" must be a valid 24-character hexadecimal ObjectId. Received: "${id}".`,
      });
    }
    next();
  };
};

// Middleware: Strict Validation for User Registration
const validateUserRegistration = (req, res, next) => {
  const { firstName, lastName, username, email, phone, password, accountType } = req.body;
  const errors = [];

  if (!firstName || typeof firstName !== "string" || firstName.trim().length < 2) {
    errors.push("First name is required and must be at least 2 characters.");
  }
  if (!lastName || typeof lastName !== "string" || lastName.trim().length < 1) {
    errors.push("Last name is required.");
  }
  if (!username || typeof username !== "string" || username.trim().length < 3) {
    errors.push("Username is required and must be at least 3 characters.");
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    errors.push("A valid email address is required.");
  }

  // Phone validation (digits between 8 and 15)
  const phoneClean = String(phone || "").replace(/[^0-9]/g, "");
  if (!phone || phoneClean.length < 8 || phoneClean.length > 15) {
    errors.push("Phone number must contain between 8 and 15 digits.");
  }

  // Password length
  if (!password || typeof password !== "string" || password.length < 6) {
    errors.push("Password must be at least 6 characters long.");
  }

  // Public registration is strictly for regular customer accounts ("user")
  if (accountType && !["user", "regular"].includes(accountType.toLowerCase())) {
    errors.push('Public registration is only permitted for customer accounts ("user"). Merchant and administrator accounts are provisioned securely.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Registration inputs are invalid.",
      errors,
    });
  }

  next();
};

// Middleware: Strict Validation for User Login
const validateUserLogin = (req, res, next) => {
  const identifier = (req.body.username || req.body.email || "").trim();
  const { password } = req.body;

  if (!identifier) {
    return res.status(400).json({
      success: false,
      message: "Username or email is required to sign in.",
    });
  }
  if (!password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Password is required.",
    });
  }

  next();
};

// Middleware: Strict Validation for Product Reviews
const validateReviewInput = (req, res, next) => {
  const { rating, comment } = req.body;
  const errors = [];

  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    errors.push("Rating must be an integer between 1 and 5 stars.");
  }

  if (!comment || typeof comment !== "string" || comment.trim().length < 3) {
    errors.push("Review comment must be at least 3 characters long.");
  }

  if (comment && comment.length > 1500) {
    errors.push("Review comment cannot exceed 1,500 characters.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Review submission is invalid.",
      errors,
    });
  }

  next();
};

// Middleware: Strict Validation for Cart Updates
const validateCartInput = (req, res, next) => {
  const { productId, quantity } = req.body;
  const errors = [];

  if (!productId || !isValidObjectId(productId)) {
    errors.push("A valid productId ObjectId is required.");
  }

  const numQty = Number(quantity);
  if (quantity !== undefined && (isNaN(numQty) || numQty < 1 || !Number.isInteger(numQty))) {
    errors.push("Quantity must be a positive integer greater than or equal to 1.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Invalid cart parameters.",
      errors,
    });
  }

  next();
};

// Middleware: Strict Validation for Product Creation (Seller & Admin)
const validateProductInput = (req, res, next) => {
  const { name, price, type, stock } = req.body;
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 3) {
    errors.push("Product name is required and must be at least 3 characters.");
  }

  const numPrice = Number(price);
  if (isNaN(numPrice) || numPrice <= 0) {
    errors.push("Price must be a positive number greater than 0.");
  }

  if (stock !== undefined) {
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      errors.push("Stock must be a non-negative integer.");
    }
  }

  const allowedTypes = ["Electronics", "Clothing", "Home", "Books", "Toys", "Others"];
  if (type && !allowedTypes.includes(type)) {
    errors.push(`Category type must be one of: ${allowedTypes.join(", ")}.`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation Error: Product details are invalid.",
      errors,
    });
  }

  next();
};

module.exports = {
  isValidObjectId,
  validateIdParam,
  validateUserRegistration,
  validateUserLogin,
  validateReviewInput,
  validateCartInput,
  validateProductInput,
};
