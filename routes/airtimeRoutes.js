const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  buyAirtime
} = require("../controllers/airtimeController");

/* =========================
   AIRTIME ROUTES
========================= */

router.post("/buy", auth, buyAirtime);

module.exports = router;