const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["airtime", "data", "credit", "debit"],
    required: true
  },

  amount: {
    type: Number,
    default: 0
  },

  balanceBefore: {
    type: Number,
    required: true
  },

  balanceAfter: {
    type: Number,
    required: true
  },

  description: String,

  reference: {
    type: String,
    required: true
  },

  status: {
  type: String,
  enum: ["pending", "processing", "success", "failed", "reversed"],
  default: "pending"
},

profit: {
  type: Number,
  default: 0
},

costPrice: {
  type: Number,
  default: 0
},

sellPrice: {
  type: Number,
  default: 0
},

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    unique: true,
    required: true
  },

  balance: {
    type: Number,
    default: 0
  },

  ledger: [ledgerSchema]
});

module.exports = mongoose.model("Wallet", walletSchema);