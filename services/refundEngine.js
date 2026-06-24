const Wallet = require("../models/Wallet");
const { sendNotification } = require("./notificationService");

exports.processRefund = async ({
  userId,
  amount,
  reference,
  reason,
  type = "refund"
}) => {
  const wallet = await Wallet.findOne({ userId });

  if (!wallet) {
    throw new Error("Wallet not found for refund");
  }

  // =========================
  // 🔒 IDEMPOTENCY CHECK
  // =========================
  const alreadyRefunded = wallet.ledger.find(
    (tx) => tx.reference === reference && tx.type === "credit"
  );

  if (alreadyRefunded) {
    return {
      message: "Refund already processed",
      skipped: true
    };
  }

  const balanceBefore = wallet.balance;

  wallet.balance += amount;

  wallet.ledger.push({
    type: "credit",
    amount,
    balanceBefore,
    balanceAfter: wallet.balance,
    description: `Refund: ${reason}`,
    reference,
    status: "success"
  });

  await wallet.save();

  await sendNotification({
    userId,
    type,
    title: "Refund Processed",
    message: `₦${amount} refunded: ${reason}`,
    metadata: { reference }
  });

  return {
    success: true,
    refunded: amount
  };
};