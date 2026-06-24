const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getMyTransactions,
  getTransactionByReference
} = require("../controllers/transactionController");



/*
 USER TRANSACTION HISTORY
*/

router.get(
  "/my",
  auth,
  getMyTransactions
);



/*
 SINGLE TRANSACTION
*/

router.get(
  "/:reference",
  auth,
  getTransactionByReference
);



module.exports = router;