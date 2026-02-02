import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    tripId: { type: String, unique: true, required: true }, 
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Entity Links
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierOwner", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyOwner", required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleOwner", required: true },

    // Trip Details
    tripDate: { type: Date, default: Date.now, required: true },
    loadingPoint: { type: String, trim: true, required: true },
    unloadingPoint: { type: String, trim: true, required: true },
    totalTonLoad: { type: Number, required: true },

    // Input Rates
    rates: {
      companyRatePerTon: { type: Number, default: 0, required: true },
      vehicleRatePerTon: { type: Number, default: 0, required: true },
      supplierRatePerTon: { type: Number, default: 0, required: true }
    },

    // Variable Expenses
    financials: {
      advancePaid: { type: Number, default: 0 },
      dieselCost: { type: Number, default: 0 },
      tollCost: { type: Number, default: 0 },
      driverExpense: { type: Number, default: 0 },
      otherExpense: { type: Number, default: 0 }
    },

    // 💰 Auto-Calculated Fields
    totalFinancials: {
      totalAmountForCompany: { type: Number, default: 0 },
      totalAmountForVehicle: { type: Number, default: 0 },
      totalAmountForSupplier: { type: Number, default: 0 },
      profitPerTrip: { type: Number, default: 0 } 
    },

    challans: [{
      fileUrl: String,
      fileName: String,
      uploadedAt: { type: Date, default: Date.now }
    }],

    status: {
      type: String,
      enum: ["pending", "running", "completed", "cancelled"],
      default: "pending"
    },

    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

/**
 * 🔥 Business Logic Engine
 * Logic: Profit = (Company Se Milne Wala Paisa) - (Vehicle Ko Dene Wala Paisa + Kharcha)
 */
const calculateTripFinancials = (doc) => {
  const load = doc.totalTonLoad || 0;
  const r = doc.rates || {};
  const f = doc.financials || {};

  const totalCompany = load * (r.companyRatePerTon || 0);
  const totalVehicle = load * (r.vehicleRatePerTon || 0);
  const totalSupplier = load * (r.supplierRatePerTon || 0);

  const totalExpenses = 
    (f.dieselCost || 0) + 
    (f.tollCost || 0) + 
    (f.driverExpense || 0) + 
    (f.otherExpense || 0);

  // Profit calculation
  const profit = totalCompany - totalVehicle - totalExpenses;

  return { totalCompany, totalVehicle, totalSupplier, profit };
};

tripSchema.pre("save", async function () {
  const result = calculateTripFinancials(this);
  
  this.totalFinancials = {
    totalAmountForCompany: result.totalCompany,
    totalAmountForVehicle: result.totalVehicle,
    totalAmountForSupplier: result.totalSupplier,
    profitPerTrip: result.profit
  };
});

export default mongoose.model("Trip", tripSchema);