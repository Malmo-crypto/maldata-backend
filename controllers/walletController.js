const Wallet = require("../models/Wallet");

/* =========================
   GET WALLET (AUTH USER)
========================= */
exports.getWallet = async (req, res) => {
  try {
    const userId = req.user.userId; // 🔥 from JWT middleware

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.json({
        balance: 0,
        transactions: []
      });
    }

    res.json(wallet);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   FUND WALLET
========================= */
exports.fundWallet = async (req, res) => {
  try {
    const userId = req.user.userId; // 🔥 secure user identity
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      wallet = new Wallet({
        userId,
        balance: 0,
        transactions: []
      });
    }

    wallet.balance += Number(amount);

    wallet.transactions.push({
      type: "credit",
      amount: Number(amount),
      description: "Wallet funded",
      date: new Date()
    });

    await wallet.save();

    res.json({
      message: "Wallet funded successfully",
      balance: wallet.balance
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DEBIT WALLET (UTILITY)
========================= */
exports.debitWallet = async (userId, amount, description = "Debit") => {
  try {
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.balance < amount) {
      throw new Error("Insufficient balance");
    }

    wallet.balance -= amount;

    wallet.transactions.push({
      type: "debit",
      amount,
      description,
      date: new Date()
    });

    await wallet.save();

    return wallet;

  } catch (err) {
    throw err;
  }
};