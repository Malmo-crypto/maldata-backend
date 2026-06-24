const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { getWallet, fundWallet } = require("../controllers/walletController");

// protected routes
router.get("/", auth, getWallet);
router.post("/fund", auth, fundWallet);

module.exports = router;