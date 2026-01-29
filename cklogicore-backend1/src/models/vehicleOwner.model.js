const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicleType: String,
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    driverName: String,
    driverMobile: String,
    ownerName: String,
    ownerAddress: String,
    perTonRate: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);
