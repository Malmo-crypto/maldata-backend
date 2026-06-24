const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getDashboardStats
} = require("../controllers/adminAnalyticsController");

router.get("/dashboard", auth, admin, getDashboardStats);

module.exports = router;   // ✅ MUST BE LIKE THIS