const mongoose = require("mongoose");

const dataPlanSchema = new mongoose.Schema({
  network: {
    type: String,
    required: true
  },

  networkName: {
    type: String
  },

  planId: {
    type: String,
    required: true
  },

  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    default: 0
  },

  validity: String,

  type: String,

  raw: Object,

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("DataPlan", dataPlanSchema);