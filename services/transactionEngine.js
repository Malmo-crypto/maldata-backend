const Wallet = require("../models/Wallet");
const Transaction = require("../models/Transaction");

const { sendNotification } = require("./notificationService");
const { updateTransaction } = require("./transactionService");


// ============================
// 🟡 CREATE PENDING TRANSACTION
// ============================
exports.createPendingTransaction = async ({
  userId,
  type,
  amount,
  description,
  reference
}) => {
  return await Transaction.create({
    userId,
    type,
    amount,
    description,
    reference,
    status: "pending",
    refunded: false
  });
};


// ============================
// 🟢 MARK SUCCESS
// ============================
exports.markTransactionSuccess = async ({
  userId,
  reference,
  amount,
  metadata = {}
}) => {

  const transaction = await updateTransaction({
    reference,
    status: "success",
    providerResponse: metadata
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  const wallet = await Wallet.findOne({ userId });

  if (wallet) {

    const balanceBefore = wallet.balance;

    // IMPORTANT: deduct wallet
    wallet.balance -= amount;

    wallet.ledger.push({
      type: transaction.type,
      amount,
      balanceBefore,
      balanceAfter: wallet.balance,
      description: transaction.description || "Transaction successful",
      reference,
      status: "success",
      costPrice: metadata.costPrice || 0,
      sellPrice: metadata.sellPrice || amount,
      profit: metadata.profit || 0
    });

    await wallet.save();
  }

  // NOTIFICATION
  await sendNotification({
    userId,
    type: transaction.type,
    title: `${transaction.type.toUpperCase()} Successful`,
    message: metadata.phone
      ? `${transaction.type} sent to ${metadata.phone} successfully`
      : `${transaction.description || "Transaction completed successfully"}`,
    metadata: { reference, amount }
  });

  return transaction;
};


// ============================
// 🔴 MARK FAILED + AUTO REFUND SAFE ENGINE
// ============================
exports.markTransactionFailed = async ({
  userId,
  reference,
  reason,
  refund = false,
  amount = 0
}) => {

  const transaction = await updateTransaction({
    reference,
    status: "failed"
  });

  if (!transaction) {
    throw new Error("Transaction not found");
  }

  // =========================
  // 🔥 SAFE REFUND LOGIC
  // =========================
  if (refund && amount > 0) {

    const freshTx = await Transaction.findOne({ reference });

    // 🚨 ALREADY REFUNDED → STOP HERE
    if (freshTx?.refunded) {
      console.log("⚠️ Refund skipped (already processed)");
      return transaction;
    }

    const wallet = await Wallet.findOne({ userId });

    if (wallet) {

      const balanceBefore = wallet.balance;

      // refund money
      wallet.balance += amount;

      wallet.ledger.push({
        type: "credit",
        amount,
        balanceBefore,
        balanceAfter: wallet.balance,
        description: `Refund: ${reason}`,
        reference,
        status: "success",
        costPrice: 0,
        sellPrice: amount,
        profit: 0
      });

      await wallet.save();
    }

    // mark refunded
    freshTx.refunded = true;
    freshTx.refundReason = reason;
    freshTx.refundAt = new Date();

    await freshTx.save();
  }

  // NOTIFICATION
  await sendNotification({
    userId,
    type: transaction?.type || "system",
    title: "Transaction Failed",
    message: reason,
    metadata: { reference }
  });

  return transaction;
};