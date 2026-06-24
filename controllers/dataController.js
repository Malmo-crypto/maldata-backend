const { buyData } = require("../services/vtuService");

const {
  createPendingTransaction,
  markTransactionSuccess,
  markTransactionFailed
} = require("../services/transactionEngine");

const { calculateDataProfit } = require("../services/profitEngine");

// 🔔 ADD THIS IMPORT
const { sendNotification } = require("../services/notificationService");


exports.buyData = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { phone, network, plan } = req.body;

    const reference = "DATA_" + Date.now();

    // STEP 1: PENDING
    await createPendingTransaction({
      userId,
      type: "data",
      amount: plan,
      description: `Data ${network} → ${phone}`,
      reference
    });

    // STEP 2: VTU CALL
    const vtuResponse = await buyData({
      phone,
      network,
      plan,
      reference
    });

    const success =
      vtuResponse?.statuscode === "100" ||
      vtuResponse?.orderstatus === "ORDER_COMPLETED";

    if (!success) {
  await markTransactionFailed({
    userId,
    reference,
    reason: "Data purchase failed",
    refund: true,
    amount: Number(plan)
  });

  return res.status(400).json({
    error: "Data purchase failed",
    vtuResponse
  });
}

    // STEP 3: COST PRICE
    const costPrice = Number(plan);

    // STEP 4: PROFIT ENGINE
    const profitData = calculateDataProfit({
      costPrice,
      network
    });

    // STEP 5: SUCCESS UPDATE
    await markTransactionSuccess({
      userId,
      reference,
      amount: profitData.sellPrice,
      metadata: {
        costPrice: profitData.costPrice,
        sellPrice: profitData.sellPrice,
        profit: profitData.profit,
        network,
        phone,
        plan
      }
    });


    // STEP 7: RESPONSE
    return res.json({
      message: "Data purchase successful",
      reference,
      costPrice: profitData.costPrice,
      sellPrice: profitData.sellPrice,
      profit: profitData.profit
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};