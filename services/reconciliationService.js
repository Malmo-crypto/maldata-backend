const axios = require("axios");
const Transaction = require("../models/Transaction");
const { processRefund } = require("./refundEngine");

/**
 * ==============================
 * RECONCILIATION ENGINE (FINTECH)
 * ==============================
 * - verifies provider status
 * - updates transaction only
 * - triggers refund safely if needed
 * - fully idempotent
 */

exports.verifyTransaction = async ({ reference, userId }) => {
  try {

    // =========================
    // 1. GET TRANSACTION (SOURCE OF TRUTH)
    // =========================
    const tx = await Transaction.findOne({ reference, userId });

    if (!tx) {
      throw new Error("Transaction not found");
    }

    // =========================
    // 2. IDEMPOTENCY CHECK
    // =========================
    if (tx.status === "success") {
      return {
        message: "Transaction already successful",
        status: "skipped"
      };
    }

    if (tx.status === "failed" && tx.refunded === true) {
      return {
        message: "Already failed and refunded",
        status: "skipped"
      };
    }

    // =========================
    // 3. CALL PROVIDER (CLUBKONNECT)
    // =========================
    const url =
      `https://www.nellobytesystems.com/APIQueryV1.asp?` +
      `UserID=${process.env.VTU_USER_ID}&` +
      `APIKey=${process.env.VTU_API_KEY}&` +
      `RequestID=${reference}`;

    const response = await axios.get(url);
    const data = response.data;

    // =========================
    // 4. SUCCESS CASE
    // =========================
    if (
      data.statuscode === "200" ||
      data.orderstatus === "ORDER_COMPLETED"
    ) {

      tx.status = "success";
      tx.providerResponse = data;

      await tx.save();

      return {
        message: "Transaction confirmed successful",
        status: "success",
        data
      };
    }

    // =========================
    // 5. FAILED CASE (TRIGGER REFUND)
    // =========================
    if (
      data.statuscode === "400" ||
      data.orderstatus === "FAILED"
    ) {

      tx.status = "failed";
      tx.providerResponse = data;

      await tx.save();

      // =========================
      // SAFE REFUND CALL (IMPORTANT)
      // =========================
      if (!tx.refunded) {

        const refundResult = await processRefund({
          userId: tx.userId,
          amount: tx.amount,
          reference: tx.reference,
          reason: data.message || "Provider failed transaction"
        });

        tx.refunded = true;
        await tx.save();

        return {
          message: "Transaction failed and refunded",
          status: "failed_refunded",
          refundResult
        };
      }

      return {
        message: "Transaction failed (already refunded)",
        status: "failed"
      };
    }

    // =========================
    // 6. PROCESSING CASE
    // =========================
    tx.status = "processing";
    tx.providerResponse = data;

    await tx.save();

    return {
      message: "Transaction still processing",
      status: "processing",
      data
    };

  } catch (err) {
    console.error("Reconciliation Error:", err.message);

    return {
      message: "Reconciliation error",
      error: err.message
    };
  }
};