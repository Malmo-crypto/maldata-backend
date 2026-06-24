const { verifyTransaction } = require("../services/reconciliationService");

exports.reconcileTransaction = async (req, res) => {
  try {

    const userId = req.user.userId;
    const { reference } = req.params;

    const result = await verifyTransaction({
      reference,
      userId
    });

    return res.json(result);

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
};