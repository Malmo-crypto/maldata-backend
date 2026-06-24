const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// 🚀 CREATE ADMIN USER (ONE TIME ONLY)
router.get("/create-admin", async (req, res) => {
  try {
    const existing = await User.findOne({ email: "admin@maldata.com" });

    if (existing) {
      return res.json({
        message: "Admin already exists",
        admin: existing
      });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Maldata Admin",
      email: "admin@maldata.com",
      password: hashedPassword,
      role: "admin"
    });

    res.json({
      message: "Admin created successfully",
      admin
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;