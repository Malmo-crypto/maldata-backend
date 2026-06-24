const cron = require("node-cron");
const { syncDataPlans } = require("../services/syncDataPlans");

const startSyncJob = () => {

  // every 24 hours
  cron.schedule("0 2 * * *", async () => {
    console.log("Syncing data plans...");

    try {
      const result = await syncDataPlans();
      console.log(result);
    } catch (err) {
      console.log("Sync error:", err.message);
    }

  });

};

module.exports = startSyncJob;