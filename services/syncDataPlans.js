const axios = require("axios");
const DataPlan = require("../models/DataPlan");
require("dotenv").config();

exports.syncDataPlans = async () => {
  try {

    const url =
      `https://www.nellobytesystems.com/APIDatabundlePlansV2.asp?UserID=${process.env.VTU_USER_ID}`;

    const response = await axios.get(url);

    const data = response.data;

    // Clear old plans
    await DataPlan.deleteMany({});

    const formattedPlans = [];

    // =========================
    // MTN
    // =========================
    if (data.MTN) {
      for (const plan of data.MTN) {
        formattedPlans.push({
          network: "01",
          networkName: "MTN",
          planId: plan.id || plan.plan || plan.value,
          name: plan.name || "MTN Plan",
          price: plan.price || 0,
          validity: plan.validity || "",
          type: plan.type || "",
          raw: plan
        });
      }
    }

    // =========================
    // GLO
    // =========================
    if (data.GLO) {
      for (const plan of data.GLO) {
        formattedPlans.push({
          network: "02",
          networkName: "GLO",
          planId: plan.id || plan.plan || plan.value,
          name: plan.name || "GLO Plan",
          price: plan.price || 0,
          validity: plan.validity || "",
          type: plan.type || "",
          raw: plan
        });
      }
    }

    // =========================
    // AIRTEL
    // =========================
    if (data.AIRTEL) {
      for (const plan of data.AIRTEL) {
        formattedPlans.push({
          network: "04",
          networkName: "AIRTEL",
          planId: plan.id || plan.plan || plan.value,
          name: plan.name || "AIRTEL Plan",
          price: plan.price || 0,
          validity: plan.validity || "",
          type: plan.type || "",
          raw: plan
        });
      }
    }

    // =========================
    // 9MOBILE
    // =========================
    if (data["9MOBILE"]) {
      for (const plan of data["9MOBILE"]) {
        formattedPlans.push({
          network: "03",
          networkName: "9MOBILE",
          planId: plan.id || plan.plan || plan.value,
          name: plan.name || "9MOBILE Plan",
          price: plan.price || 0,
          validity: plan.validity || "",
          type: plan.type || "",
          raw: plan
        });
      }
    }

    await DataPlan.insertMany(formattedPlans);

    return {
      message: "Data plans synced successfully",
      count: formattedPlans.length
    };

  } catch (err) {
    throw new Error("Sync failed: " + err.message);
  }
};