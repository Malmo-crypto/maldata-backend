const axios = require("axios");
require("dotenv").config();

exports.buyAirtime = async ({ phone, amount, network, reference }) => {
  const response = await axios.get(
    "https://www.nellobytesystems.com/APIAirtimeV1.asp",
    {
      params: {
        UserID: process.env.VTU_USER_ID,
        APIKey: process.env.VTU_API_KEY,
        MobileNetwork: network,
        Amount: amount,
        MobileNumber: phone,
        RequestID: reference
      }
    }
  );

  return response.data;
};

exports.buyData = async ({ phone, network, plan, reference }) => {
  const response = await axios.get(
    "https://www.nellobytesystems.com/APIDatabundleV1.asp",
    {
      params: {
        UserID: process.env.VTU_USER_ID,
        APIKey: process.env.VTU_API_KEY,
        MobileNetwork: network,
        DataPlan: plan,
        MobileNumber: phone,
        RequestID: reference
      }
    }
  );

  return response.data;
};