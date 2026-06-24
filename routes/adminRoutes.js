const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getAllUsers,
  getUserById,
  deleteUser
} = require("../controllers/adminController");

router.get("/users", auth, admin, getAllUsers);
router.get("/users/:id", auth, admin, getUserById);
router.delete("/users/:id", auth, admin, deleteUser);

module.exports = router;