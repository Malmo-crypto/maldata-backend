const DataPlan = require("../models/DataPlan");

exports.getPlans = async (req, res) => {
  try {

    const plans = await DataPlan.find({});

    return res.json({
      message: "Plans fetched from DB",
      count: plans.length,
      data: plans
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};