const crypto = require("crypto");
const Wallet = require("../models/Wallet");
const { updateTransaction } = require("../services/transactionService");

// 🔔 ADD NOTIFICATIONS
const { sendNotification } = require("../services/notificationService");

exports.paystackWebhook = async (req, res) => {
  try {
    console.log("PAYSTACK WEBHOOK RECEIVED");

    const isDevMode = process.env.WEBHOOK_DEV_MODE === "true";

    // ===============================
    // 1. VERIFY SIGNATURE
    // ===============================
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (!isDevMode) {
      if (hash !== req.headers["x-paystack-signature"]) {
        console.log("INVALID SIGNATURE");
        return res.sendStatus(401);
      }
    }

    const event = req.body;

    // ===============================
    // 2. ONLY SUCCESSFUL PAYMENTS
    // ===============================
    if (event.event === "charge.success") {

      const data = event.data;
      const reference = data.reference;

      console.log("PROCESSING:", reference);

      // ===============================
      // 3. UPDATE TRANSACTION
      // ===============================
      const transaction = await updateTransaction({
        reference,
        status: "success",
        providerResponse: data
      });

      if (!transaction) {
        console.log("Transaction not found");
        return res.sendStatus(200);
      }

      // ===============================
      // 4. PREVENT DOUBLE CREDIT
      // ===============================
      if (transaction.processed === true) {
        console.log("Duplicate webhook ignored");
        return res.sendStatus(200);
      }

      // mark FIRST (fix race condition)
      transaction.processed = true;
      await transaction.save();

      // ===============================
      // 5. CREDIT WALLET
      // ===============================
      const wallet = await Wallet.findOne({
        userId: transaction.userId
      });

      if (!wallet) {
        console.log("Wallet not found");
        return res.sendStatus(200);
      }

      const amount = Number(transaction.amount);

      const balanceBefore = wallet.balance;
      wallet.balance += amount;

      // FIX: use ledger (NOT transactions)
      wallet.ledger.push({
        type: "credit",
        amount,
        balanceBefore,
        balanceAfter: wallet.balance,
        description: "Wallet funding via Paystack",
        reference,
        status: "success"
      });

      await wallet.save();

      console.log("WALLET UPDATED SUCCESSFULLY");

      // ===============================
      // 6. NOTIFICATION (ADD HERE)
      // ===============================
      await sendNotification({
        userId: transaction.userId,
        type: "deposit",
        title: "Wallet Funded",
        message: `Your wallet has been credited with ₦${amount}`,
        metadata: {
          amount,
          reference
        }
      });
    }

    return res.sendStatus(200);

  } catch (err) {
    console.log("WEBHOOK ERROR:", err.message);
    return res.sendStatus(500);
  }
};