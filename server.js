process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const app = express();

// 🔌 CONNECT DB FIRST
connectDB();

// 🔐 MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// =========================
// 🚀 ROUTES IMPORTS
// =========================
const setupRoutes = require("./routes/setupRoutes");
const authRoutes = require("./routes/authRoutes");
const walletRoutes = require("./routes/walletRoutes");
const dataRoutes = require("./routes/dataRoutes");
const depositRoutes = require("./routes/depositRoutes");
const airtimeRoutes = require("./routes/airtimeRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const adminRoutes = require("./routes/adminRoutes"); // ✅ FIXED
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");

const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const paymentWebhookRoutes = require("./routes/paymentWebhookRoutes");

// =========================
// 🚀 ROUTE USAGE
// =========================
app.use("/api/setup", setupRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/deposit", depositRoutes);
app.use("/api/airtime", airtimeRoutes);
app.use("/api/transactions", transactionRoutes);

// ADMIN
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// USER
app.use("/api/user", userRoutes);

// NOTIFICATIONS
app.use("/api/notifications", notificationRoutes);

// WEBHOOK
app.use("/api/webhook", paymentWebhookRoutes);

// =========================
// 🧪 TEST ROUTES
// =========================
const User = require("./models/User");

app.get("/", (req, res) => {
  res.send("🚀 Maldata API is running");
});

app.get("/create-test-user", async (req, res) => {
  try {
    const user = await User.create({
      name: "Maldata Test",
      email: "test@gmail.com",
      password: "123456",
    });

    res.json(user);
  } catch (err) {
    res.json({ error: err.message });
  }
});

// =========================
// 🚀 BACKGROUND JOBS
// =========================
const startSyncJob = require("./jobs/syncPlansJob");
const startReconciliationJob = require("./jobs/ReconciliationJob");

startSyncJob();
startReconciliationJob();

// =========================
// 🚀 START SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});