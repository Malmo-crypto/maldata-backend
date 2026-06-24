const { buyAirtime } = require("../services/vtuService");

const {
  createPendingTransaction,
  markTransactionSuccess,
  markTransactionFailed
} = require("../services/transactionEngine");

const { calculateAirtimeProfit } = require("../services/profitEngine");

// 🔔 ADD THIS IMPORT ON TOP
const { sendNotification } = require("../services/notificationService");


exports.buyAirtime = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { phone, amount, network } = req.body;

    const reference = "AIRTIME_" + Date.now();

    // STEP 1: PENDING TX
    await createPendingTransaction({
      userId,
      type: "airtime",
      amount,
      description: `Airtime ${network} → ${phone}`,
      reference
    });

    // STEP 2: CALL VTU
    const vtuResponse = await buyAirtime({
      phone,
      amount,
      network,
      reference
    });

    const success = vtuResponse && vtuResponse.status !== "failed";

   if (!success) {
  await markTransactionFailed({
    userId,
    reference,
    reason: "VTU failed",
    refund: true,
    amount
  });

  return res.status(400).json({
    error: "Airtime failed",
    vtuResponse
  });
}

    // STEP 3: PROFIT CALCULATION
    const profitData = calculateAirtimeProfit({
      faceValue: Number(amount),
      network
    });

    // STEP 4: SUCCESS UPDATE
    await markTransactionSuccess({
      userId,
      reference,
      amount: profitData.sellPrice,
      metadata: {
        costPrice: profitData.costPrice,
        sellPrice: profitData.sellPrice,
        profit: profitData.profit
      }
    });


    return res.json({
      message: "Airtime successful",
      reference,
      costPrice: profitData.costPrice,
      sellPrice: profitData.sellPrice,
      profit: profitData.profit
    });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};