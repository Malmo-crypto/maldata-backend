const User = require("../models/User");

const {
  createTransaction
} = require("../services/transactionService");

const {
  initializePayment
} = require("../services/paymentService");

// 🔔 NOTIFICATIONS
const { sendNotification } = require("../services/notificationService");

exports.createDeposit = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { amount } = req.body;

    // ===============================
    // 1. VALIDATE AMOUNT
    // ===============================
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: "Invalid deposit amount"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // ===============================
    // 2. GENERATE UNIQUE REFERENCE
    // ===============================
    const reference = "DEP_" + Date.now() + "_" + userId;

    // ===============================
    // 3. CREATE TRANSACTION (PENDING)
    // ===============================
    await createTransaction({
      userId,
      type: "deposit",
      amount,
      reference,
      status: "pending",
      metadata: {
        method: "paystack"
      }
    });

    // ===============================
    // 4. INITIALIZE PAYSTACK PAYMENT
    // ===============================
    const payment = await initializePayment({
      email: user.email,
      amount: amount * 100, // IMPORTANT: Paystack uses kobo
      reference
    });

    // ===============================
    // 5. NOTIFICATION (DEPOSIT INITIATED)
    // ===============================
    await sendNotification({
      userId,
      type: "deposit",
      title: "Deposit Initiated",
      message: `Your deposit of ₦${amount} has been initiated`,
      metadata: {
        amount,
        reference
      }
    });

    // ===============================
    // 6. RESPONSE
    // ===============================
    return res.json({
      message: "Payment initialized",
      reference,
      authorization_url: payment.data.authorization_url
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};