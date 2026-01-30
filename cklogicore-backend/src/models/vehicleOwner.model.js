import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },

    vehicleNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },

    capacity: {
      type: String,
      required: true
    },

    owner: {
      name: { type: String, required: true },
      mobile: { type: String, required: true }
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

    meta: mongoose.Schema.Types.Mixed,

    // ✅ Soft Delete
    isActive: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);
// ✅ Unique per account (vehicleNumber + accountId)
vehicleSchema.index(
  { accountId: 1, vehicleNumber: 1 },
  { unique: true }
);

// 🔒 Lock vehicleNumber (No Update)
vehicleSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update?.vehicleNumber || update?.$set?.vehicleNumber) {
    return next(new Error("Vehicle number cannot be updated"));
  }

  next();
});

export default mongoose.model("VehicleOwner", vehicleSchema);