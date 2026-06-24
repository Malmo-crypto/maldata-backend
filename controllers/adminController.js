const User = require("../models/User");
const Wallet = require("../models/Wallet");

/**
 * GET ALL USERS
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    return res.json({
      total: users.length,
      users
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * GET SINGLE USER DETAILS
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    const wallet = await Wallet.findOne({ userId: req.params.id });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      user,
      wallet: wallet || null
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/**
 * DELETE USER
 */
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Wallet.findOneAndDelete({ userId: req.params.id });

    return res.json({
      message: "User deleted successfully"
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};