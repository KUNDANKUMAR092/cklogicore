const mongoose = require("mongoose");

const transportSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    loadDate: Date,
    unloadDate: Date,

    loadTotalTon: {
      type: Number,
      required: true,
    },
    unloadTotalTon: {
      type: Number,
      required: true,
    },

    companyPerTonRate: Number,
    vehiclePerTonRate: Number,
    supplierProfitPerTon: Number,

    companyTotalAmount: Number,
    vehicleTotalAmount: Number,
    supplierTotalProfit: Number,

    chalnLoad: String,
    chalnUnload: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdByRole: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transport", transportSchema);
