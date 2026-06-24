const axios = require("axios");
require("dotenv").config();

let cachedPlans = null;
let lastFetchTime = null;

exports.fetchDataPlans = async () => {
  try {

    // cache for 1 hour (important for performance)
    const now = Date.now();

    if (cachedPlans && lastFetchTime && (now - lastFetchTime < 3600000)) {
      return cachedPlans;
    }

    const url =
      `https://www.nellobytesystems.com/APIDatabundlePlansV2.asp?UserID=${process.env.VTU_USER_ID}`;

    const response = await axios.get(url);

    cachedPlans = response.data;
    lastFetchTime = now;

    return cachedPlans;

  } catch (err) {
    throw new Error("Failed to fetch data plans: " + err.message);
  }
};