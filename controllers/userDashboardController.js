const Wallet = require("../models/Wallet");
const User = require("../models/User");

exports.getUserDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    // 👤 GET USER PROFILE
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // 💰 GET WALLET
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({
        error: "Wallet not found"
      });
    }

    // 📊 STATS CALCULATION
    let totalSpent = 0;

    const recentTransactions = wallet.ledger
      .slice(-20)
      .reverse();

    for (const tx of wallet.ledger) {
      if (tx.type === "airtime" || tx.type === "data") {
        totalSpent += Number(tx.sellPrice || 0);
      }
    }

    // 🚀 RESPONSE
    return res.json({
      profile: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },

      wallet: {
        balance: wallet.balance,
        lockedBalance: wallet.lockedBalance || 0
      },

      stats: {
        totalSpent,
        totalTransactions: wallet.ledger.length
      },

      recentTransactions
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};