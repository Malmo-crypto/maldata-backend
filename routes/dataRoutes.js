const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const { buyData } = require("../controllers/dataController");

router.post("/buy", auth, buyData);

module.exports = router;