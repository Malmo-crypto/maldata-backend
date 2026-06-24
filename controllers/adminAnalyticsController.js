const Wallet = require("../models/Wallet");

/**
 * DASHBOARD SUMMARY
 */
exports.getDashboardStats = async (req, res) => {
  try {

    const wallets = await Wallet.find({});

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    let airtimeProfit = 0;
    let dataProfit = 0;
    let depositProfit = 0;

    let totalTransactions = 0;
    let success = 0;
    let failed = 0;
    let pending = 0;

    let userMap = new Map();

    for (const wallet of wallets) {

      let userSpent = 0;
      let userProfit = 0;
      let userTx = 0;

      for (const tx of wallet.ledger) {

        totalTransactions++;
        userTx++;

        totalRevenue += tx.sellPrice || 0;
        totalCost += tx.costPrice || 0;
        totalProfit += tx.profit || 0;

        userSpent += tx.sellPrice || 0;
        userProfit += tx.profit || 0;

        if (tx.type === "airtime") airtimeProfit += tx.profit || 0;
        if (tx.type === "data") dataProfit += tx.profit || 0;
        if (tx.type === "deposit") depositProfit += tx.profit || 0;

        if (tx.status === "success") success++;
        else if (tx.status === "failed") failed++;
        else pending++;
      }

      userMap.set(wallet.userId.toString(), {
        userId: wallet.userId,
        totalSpent: userSpent,
        totalProfit: userProfit,
        totalTransactions: userTx,
        walletBalance: wallet.balance
      });
    }

    const users = Array.from(userMap.values());

    const topUsers = users
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);

    return res.json({
      summary: {
        totalRevenue,
        totalCost,
        totalProfit
      },

      breakdown: {
        airtimeProfit,
        dataProfit,
        depositProfit
      },

      transactions: {
        totalTransactions,
        success,
        failed,
        pending
      },

      users: {
        totalUsers: users.length,
        topUsers
      }
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};