const cron = require("node-cron");
const Wallet = require("../models/Wallet");
const { verifyTransaction } = require("../services/reconciliationService");

const startReconciliationJob = () => {

  // run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {

    console.log("Running reconciliation job...");

    const wallets = await Wallet.find({});

    for (const wallet of wallets) {

      const pendingTxs = wallet.ledger.filter(
        t => t.status === "pending" || t.status === "processing"
      );

      for (const tx of pendingTxs) {
        try {

          await verifyTransaction({
            reference: tx.reference,
            userId: wallet.userId
          });

        } catch (err) {
          console.log("Recon error:", err.message);
        }
      }
    }
  });

};

module.exports = startReconciliationJob;