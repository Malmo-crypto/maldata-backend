const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getUserDashboard
} = require("../controllers/userDashboardController");

router.get("/dashboard", auth, getUserDashboard);

module.exports = router;