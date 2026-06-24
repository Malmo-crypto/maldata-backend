const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");

//
// ===============================
// 🧠 IDEMPOTENCY CHECK (IMPORTANT)
// ===============================
// prevents double debit/credit using reference
//
const isDuplicate = (wallet, reference) => {
  return wallet.ledger.some((tx) => tx.reference === reference);
};

//
// ===============================
// 🔒 DEBIT WALLET (ATOMIC SAFE)
// ===============================
//
exports.debitWallet = async ({
  userId,
  amount,
  reference,
  description
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. ATOMIC LOCK + BALANCE CHECK
    const wallet = await Wallet.findOneAndUpdate(
      {
        userId,
        balance: { $gte: amount }
      },
      {
        $inc: { balance: -amount }
      },
      {
        new: true,
        session
      }
    );

    if (!wallet) {
      throw new Error("Insufficient balance or wallet not found");
    }

    // 2. IDEMPOTENCY PROTECTION
    if (isDuplicate(wallet, reference)) {
      await session.abortTransaction();
      session.endSession();
      return wallet;
    }

    const balanceBefore = wallet.balance + amount;

    // 3. LEDGER ENTRY
    wallet.ledger.push({
      type: "debit",
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
      reference,
      status: "success"
    });

    await wallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    return wallet;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

//
// ===============================
// 💰 CREDIT WALLET (SAFE)
// ===============================
//
exports.creditWallet = async ({
  userId,
  amount,
  reference,
  description
}) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, session }
    );

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    // idempotency check
    if (isDuplicate(wallet, reference)) {
      await session.abortTransaction();
      session.endSession();
      return wallet;
    }

    const balanceBefore = wallet.balance - amount;

    wallet.ledger.push({
      type: "credit",
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description,
      reference,
      status: "success"
    });

    await wallet.save({ session });

    await session.commitTransaction();
    session.endSession();

    return wallet;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};