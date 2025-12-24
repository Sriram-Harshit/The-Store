const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

// Register a new user
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      phone,
      addresses,
      password,
      accountType,
    } = req.body;

    if (!firstName || !lastName || !username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const emailExists = await User.findOne({ email });
    const phoneExists = await User.findOne({ phone });

    if (emailExists) {
      return res.status(400).json({ message: "Email is already in use" });
    }
    if (phoneExists) {
      return res
        .status(400)
        .json({ message: "Phone number is already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      password: hashedPassword,
      addresses,
      accountType: accountType || "regular",
    });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login a user
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Logout a user
const logoutUser = (req, res) => {
  res.status(200).json({ message: "Logout successful" });
};

const userProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error); // Log error for debugging
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Fetch user addresses
const getAddresses = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.addresses);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Add address
const addAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const userId = req.user.userId;

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push(address);
    await user.save();

    res.status(201).json({ message: "Address added successfully", address });
  } catch (error) {
    res.status(500).json({ message: "Error adding address" });
  }
};

// Update address
const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { address } = req.body;
    const userId = req.user.userId;

    if (!address) {
      return res.status(400).json({ message: "Address is required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses[addressIndex] = address;
    await user.save();

    res.status(200).json({ message: "Address updated successfully", address });
  } catch (error) {
    res.status(500).json({ message: "Error updating address" });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { addressId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses = user.addresses.filter(
      (address) => address._id.toString() !== addressId
    );
    await user.save();

    res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting address" });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username, firstName, lastName, email, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, firstName, lastName, email, phone },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  userProfile,
  updateProfile,
};
