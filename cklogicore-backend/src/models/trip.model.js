import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true
    },

    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplierOwner",
      required: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CompanyOwner",
      required: true
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VehicleOwner",
      required: true
    },

    tripDate: Date,
    loadingPoint: String,
    unloadingPoint: String,

    totalTonLoad: { type: Number, required: true },

    rates: {
      companyRatePerTon: Number,
      vehicleRatePerTon: Number
    },

    financials: {
      freightAmount: Number,
      advancePaid: { type: Number, default: 0 },
      dieselCost: { type: Number, default: 0 },
      tollCost: { type: Number, default: 0 },
      driverExpense: { type: Number, default: 0 },
      otherExpense: { type: Number, default: 0 }
    },

    profit: Number,

    status: {
      type: String,
      enum: ["pending", "running", "completed", "cancelled"],
      default: "pending"
    },

    meta: mongoose.Schema.Types.Mixed,

    createdByUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

/* 🔥 AUTO PROFIT CALCULATION */
tripSchema.pre("save", function () {
  const companyFreight =
    (this.totalTonLoad || 0) *
    (this.rates?.companyRatePerTon || 0);

  const vehicleCost =
    (this.totalTonLoad || 0) *
    (this.rates?.vehicleRatePerTon || 0);

  const expenses =
    (this.financials?.dieselCost || 0) +
    (this.financials?.tollCost || 0) +
    (this.financials?.driverExpense || 0) +
    (this.financials?.otherExpense || 0);

  this.profit = companyFreight - vehicleCost - expenses;
});


export default mongoose.model("Trip", tripSchema);
