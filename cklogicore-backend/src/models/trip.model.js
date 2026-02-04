import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    tripId: { type: String, unique: true, required: true }, 
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierOwner", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyOwner", required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleOwner", required: true },

    tripDate: { type: Date, default: Date.now, required: true },
    loadingPoint: { type: String, trim: true, required: true },
    unloadingPoint: { type: String, trim: true, required: true },
    totalTonLoad: { type: Number, required: true },

    rates: {
      companyRatePerTon: { type: Number, default: 0 },
      supplierRatePerTon: { type: Number, default: 0 },
      vehicleRatePerTon: { type: Number, default: 0 },
    },

    financials: {
      companyAdvance: { type: Number, default: 0 },
      companyDiesel: { type: Number, default: 0 },
      companyTollCost: { type: Number, default: 0 },
      companyDriverExpense: { type: Number, default: 0 },
      companyOtherExpense: { type: Number, default: 0 },
      supplierAdvance: { type: Number, default: 0 },
      supplierDiesel: { type: Number, default: 0 },
      supplierTollCost: { type: Number, default: 0 },
      supplierDriverExpense: { type: Number, default: 0 },
      supplierOtherExpense: { type: Number, default: 0 }
    },

    // totalFinancials: {
    //   totalAmountForCompany: { type: Number, default: 0 },
    //   totalAmountForVehicle: { type: Number, default: 0 },
    //   totalAmountForSupplier: { type: Number, default: 0 },
    //   profitPerTrip: { type: Number, default: 0 } 
    // },

    calculated: {
      companyGrossAmount: { type: Number, default: 0 },
      supplierGrossAmount: { type: Number, default: 0 },
      vehicleGrossAmount: { type: Number, default: 0 },

      companyTotalExpense: { type: Number, default: 0 },
      supplierTotalExpense: { type: Number, default: 0 },
      vehicleTotalExpense: { type: Number, default: 0 },

      companyPendingAmount: { type: Number, default: 0 },
      supplierPendingAmount: { type: Number, default: 0 },
      vehiclePendingAmount: { type: Number, default: 0 },

      tripProfit: { type: Number, default: 0 } 
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

const calculateTripFinancials = (doc) => {
  const load = Number(doc.totalTonLoad) || 0;
  const r = doc.rates || {};
  const f = doc.financials || {};

  // 1. Gross Amounts (Rate * Ton)
  const companyGross = load * (Number(r.companyRatePerTon) || 0);
  const supplierGross = load * (Number(r.supplierRatePerTon) || 0);
  const vehicleGross = load * (Number(r.vehicleRatePerTon) || 0);
  
  // 2. Company Expenses Sum (Jo Company ne pay kiye)
  const companyExp = 
    (Number(f.companyAdvance) || 0) + (Number(f.companyDiesel) || 0) + 
    (Number(f.companyTollCost) || 0) + (Number(f.companyDriverExpense) || 0) + 
    (Number(f.companyOtherExpense) || 0);

  // 3. Supplier Expenses Sum (Jo Supplier ne pay kiye)
  const supplierExp = 
    (Number(f.supplierAdvance) || 0) + (Number(f.supplierDiesel) || 0) + 
    (Number(f.supplierTollCost) || 0) + (Number(f.supplierDriverExpense) || 0) + 
    (Number(f.supplierOtherExpense) || 0);

  // 4. Vehicle Total Expenses (Saare advances jo gaadi ko mile)
  const vehicleTotalExp = companyExp + supplierExp;

  // 5. Pending Amounts (Final settlement ke liye)
  // Company se kitna lena baaki hai
  const companyPending = companyGross - companyExp; 
  
  // Supplier ko kitna dena baaki hai (Total banta tha - jo advance de diya)
  const supplierPending = supplierGross - supplierExp;

  // Vehicle ko kitna dena baaki hai (Total banta tha - jo dono ne milke advance diya)
  const vehiclePending = vehicleGross - vehicleTotalExp;

  // 6. Trip Profit
  // Profit = Company se milne wala total - Vehicle ko dene wala total
  const profit = companyGross - vehicleGross;

  return { 
    companyGross, supplierGross, vehicleGross,
    companyExp, supplierExp, vehicleTotalExp,
    companyPending, supplierPending, vehiclePending,
    profit 
  };
};


tripSchema.pre("save", async function () { 
  try {
    // Basic Validation Check
    if (!this.totalTonLoad || this.totalTonLoad <= 0) {
      throw new Error("Total Ton Load is required and must be greater than 0");
    }

    // Rate Check (Kam se kam vehicle rate hona zaroori hai business logic ke hisaab se)
    if (!this.rates || (!this.rates.companyRatePerTon && !this.rates.vehicleRatePerTon)) {
       // Aap ise warning ya error bana sakte hain
       console.warn("Rates are missing for trip:", this.tripId);
    }
    const res = calculateTripFinancials(this);

    this.calculated = {
      companyGrossAmount: res.companyGross,
      supplierGrossAmount: res.supplierGross,
      vehicleGrossAmount: res.vehicleGross,

      companyTotalExpense: res.companyExp,
      supplierTotalExpense: res.supplierExp,
      vehicleTotalExpense: res.vehicleTotalExp, // Total advances given to vehicle

      companyPendingAmount: res.companyPending,
      supplierPendingAmount: res.supplierPending,
      vehiclePendingAmount: res.vehiclePending,

      tripProfit: res.profit,
    };
  } catch (error) {
    console.error("Calculation Error:", error); 
    throw error; 
  }
});





// Calculation Engine
// const calculateTripFinancials = (doc) => {
//   console.log(doc);
//   const load = Number(doc.totalTonLoad) || 0;
//   const r = doc.rates || {};
//   const f = doc.financials || {};

//   const totalCompany = load * (Number(r.companyRatePerTon) || 0);
//   const totalVehicle = load * (Number(r.vehicleRatePerTon) || 0);
//   const totalSupplier = load * (Number(r.supplierRatePerTon) || 0);

//   // Saare expenses ka sum (including supplier expenses)
//   const totalExpenses = 
//     (Number(f.companyAdvance) || 0) + (Number(f.companyDiesel) || 0) + 
//     (Number(f.companyTollCost) || 0) + (Number(f.companyDriverExpense) || 0) + 
//     (Number(f.companyOtherExpense) || 0) + (Number(f.supplierAdvance) || 0) + 
//     (Number(f.supplierDiesel) || 0) + (Number(f.supplierTollCost) || 0) + 
//     (Number(f.supplierDriverExpense) || 0) + (Number(f.supplierOtherExpense) || 0);

//   const profit = totalCompany - totalVehicle - totalExpenses;
//   return { totalCompany, totalVehicle, totalSupplier, profit };
// };

// const calculateTripFinancials = (doc) => {
//   const load = Number(doc.totalTonLoad) || 0;
//   const r = doc.rates || {};
//   const f = doc.financials || {};

//   // 1. Basic Totals based on Rate * Load
//   const totalCompanyGrossAmount = load * (Number(r.companyRatePerTon) || 0);
//   const totalSupplierGrossAmount = load * (Number(r.supplierRatePerTon) || 0);
//   const totalVehicleGrossAmount = load * (Number(r.vehicleRatePerTon) || 0);
  
//   // 2. Sum of Company Expenses
//   const companyExpenseTotal = 
//     (Number(f.companyAdvance) || 0) + 
//     (Number(f.companyDiesel) || 0) + 
//     (Number(f.companyTollCost) || 0) + 
//     (Number(f.companyDriverExpense) || 0) + 
//     (Number(f.companyOtherExpense) || 0);

//   // 3. Sum of Supplier Expenses
//   const supplierExpenseTotal = 
//     (Number(f.supplierAdvance) || 0) + 
//     (Number(f.supplierDiesel) || 0) + 
//     (Number(f.supplierTollCost) || 0) + 
//     (Number(f.supplierDriverExpense) || 0) + 
//     (Number(f.supplierOtherExpense) || 0);

//   // 4. Sum of Supplier Expenses
//   const vehicleExpenseTotal = 
//     (Number(f.vehicleAdvance) || 0) + 
//     (Number(f.vehicleDiesel) || 0) + 
//     (Number(f.vehicleTollCost) || 0) + 
//     (Number(f.vehicleDriverExpense) || 0) + 
//     (Number(f.vehicleOtherExpense) || 0);

//   // 4. Final Vehicle Amount (Base - All Expenses)
//   // Vehicle ko wahi milega jo rate se banta hai minus jo advance/expenses pehle de diye gaye hain
//   const finalCompanyAmountTotal = totalCompanyGrossAmount - companyExpenseTotal;
//   const finalSupplierAmountTotal = totalCompanyGrossAmount - (companyExpenseTotal + totalVehicleGrossAmount);
//   const finalVehicleAmountTotal = totalCompanyGrossAmount - (companyExpenseTotal + supplierExpenseTotal);

//   // 5. Profit Calculation
//   // Profit = Company ko kitna mila - Vehicle ko total kitna dena tha (base amount)
//   // Note: Expenses already vehicle ke hisse se kat rahe hain
//   const profit = finalCompanyAmountTotal - finalVehicleAmountTotal;

//   return { 
//     totalCompanyGrossAmount, 
//     totalSupplierGrossAmount, 
//     totalVehicleGrossAmount, 

//     companyExpenseTotal,
//     supplierExpenseTotal,
//     vehicleExpenseTotal,

//     finalCompanyAmountTotal,
//     finalSupplierAmountTotal,
//     finalVehicleAmountTotal,

//     profit 
//   };
// };


// tripSchema.pre("save", async function () { 
//   try {
//     const result = calculateTripFinancials(this);

//     this.calculated = {
//       companyGrossAmount: result.totalCompanyGrossAmount,
//       supplierGrossAmount: result.totalSupplierGrossAmount,
//       vehicleGrossAmount: result.totalVehicleGrossAmount,

//       companyTotalExpense: result.companyExpenseTotal,
//       supplierTotalExpense: result.supplierExpenseTotal,
//       vehicleTotalExpense: result.vehicleExpenseTotal,

//       companyPendingAmount: result.finalCompanyAmountTotal,
//       supplierPendingAmount: result.finalSupplierAmountTotal,
//       vehiclePendingAmount: result.finalVehicleAmountTotal,

//       tripProfit: result.profit,
//     }
//   } catch (error) {
//     console.error("Calculation Error:", error);
//     throw error; 
//   }
// });

export default mongoose.model("Trip", tripSchema);