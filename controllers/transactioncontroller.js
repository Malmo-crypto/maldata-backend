const Transaction = require("../models/Transaction");


/* =========================
   USER TRANSACTION HISTORY
========================= */
exports.getMyTransactions = async (req, res) => {
  try {

    const userId = req.user.userId;

    const transactions = await Transaction.find({
      userId
    })
    .sort({
      createdAt: -1
    });


    res.json({
      total: transactions.length,
      transactions
    });


  } catch (err) {

    res.status(500).json({
      error: err.message
    });

  }
};



/* =========================
   SINGLE TRANSACTION
========================= */
exports.getTransactionByReference = async (req, res) => {

  try {

    const { reference } = req.params;


    const transaction = await Transaction.findOne({
      reference
    });


    if (!transaction) {
      return res.status(404).json({
        error:"Transaction not found"
      });
    }


    res.json(transaction);



  } catch(err){

    res.status(500).json({
      error:err.message
    });

  }

};