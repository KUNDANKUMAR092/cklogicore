import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },

    vehicleNumber: { type: String, required: true },
    capacity: String,

    owner: {
      name: String,
      mobile: String
    },

    driver: {
      name: String,
      phone: String
    },

    documents: {
      rcExpiry: Date,
      insuranceExpiry: Date,
      permitExpiry: Date
    },

    meta: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export default mongoose.model("VehicleOwner", vehicleSchema);
