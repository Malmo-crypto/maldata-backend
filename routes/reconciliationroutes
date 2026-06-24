const express = require("express");
const router = express.Router();

const {
  reconcileTransaction
} = require("../controllers/reconciliationController");

router.get("/reconcile/:reference", reconcileTransaction);

module.exports = router;