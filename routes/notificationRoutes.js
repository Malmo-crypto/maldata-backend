const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getUserNotifications,
  markAsRead
} = require("../controllers/notificationController");


router.get("/", auth, getUserNotifications);

router.patch(
 "/:notificationId/read",
 auth,
 markAsRead
);


module.exports = router;