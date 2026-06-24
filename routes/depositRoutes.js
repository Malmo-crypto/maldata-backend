const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  createDeposit
} = require("../controllers/depositController");

/*
ONLY CREATE DEPOSIT (PAYSTACK FLOW)
*/
router.post("/", auth, createDeposit);

module.exports = router;