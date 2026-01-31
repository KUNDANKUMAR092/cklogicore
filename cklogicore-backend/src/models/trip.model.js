import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    tripId: { type: String, unique: true }, // Custom ID (e.g., TRP-2026-001)
    createdByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    // Entity Links
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierOwner", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "CompanyOwner", required: true },
    vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: "VehicleOwner", required: true },

    // Trip Details
    tripDate: { type: Date, default: Date.now },
    loadingPoint: { type: String, trim: true },
    unloadingPoint: { type: String, trim: true },
    totalTonLoad: { type: Number, required: true },

    // Input Rates
    rates: {
      companyRatePerTon: { type: Number, default: 0 },
      vehicleRatePerTon: { type: Number, default: 0 },
      supplierRatePerTon: { type: Number, default: 0 }
    },

    // Variable Expenses
    financials: {
      advancePaid: { type: Number, default: 0 },
      dieselCost: { type: Number, default: 0 },
      tollCost: { type: Number, default: 0 },
      driverExpense: { type: Number, default: 0 },
      otherExpense: { type: Number, default: 0 }
    },

    // 💰 Auto-Calculated Trip Fields (Stored in DB)
    totalFinancials: {
      totalAmountForCompany: { type: Number, default: 0 },
      totalAmountForVehicle: { type: Number, default: 0 },
      totalAmountForSupplier: { type: Number, default: 0 },
      profitPerTrip: { type: Number, default: 0 } // Individual Profit
    },

    // Challans Uploaded during creation
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

// 🔥 Business Calculation Engine
const runTripCalculations = (doc) => {
  const load = doc.totalTonLoad || 0;
  const r = doc.rates || {};
  const e = doc.financials || {};

  const totalCompany = load * (r.companyRatePerTon || 0);
  const totalVehicle = load * (r.vehicleRatePerTon || 0);
  const totalSupplier = load * (r.supplierRatePerTon || 0);

  const totalExpenses = (e.dieselCost || 0) + (e.tollCost || 0) + (e.driverExpense || 0) + (e.otherExpense || 0);

  // profitPerTrip = What you get from Company - (What you pay Vehicle + Expenses)
  const profit = totalCompany - totalVehicle - totalExpenses;

  return { totalCompany, totalVehicle, totalSupplier, profit };
};

// Middleware to calculate before saving
tripSchema.pre("save", function (next) {
  const result = runTripCalculations(this);
  this.totalFinancials.totalAmountForCompany = result.totalCompany;
  this.totalFinancials.totalAmountForVehicle = result.totalVehicle;
  this.totalFinancials.totalAmountForSupplier = result.totalSupplier;
  this.totalFinancials.profitPerTrip = result.profit;
  next();
});

export default mongoose.model("Trip", tripSchema);













// import mongoose from "mongoose";

// const tripSchema = new mongoose.Schema(
//   {
//     accountId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Account",
//       required: true,
//       index: true
//     },
//     // Human-readable ID (Ex: TRIP-101)
//     tripId: { type: String, unique: true },

//     createdByUserId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User"
//     },

//     supplierId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "SupplierOwner",
//       required: true
//     },

//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "CompanyOwner",
//       required: true
//     },

//     vehicleId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "VehicleOwner",
//       required: true
//     },

//     tripDate: { type: Date, default: Date.now },
//     loadingPoint: String,
//     unloadingPoint: String,
//     totalTonLoad: { type: Number, required: true },

//     rates: {
//       companyRatePerTon: { type: Number, default: 0 },
//       vehicleRatePerTon: { type: Number, default: 0 },
//       supplierRatePerTon: { type: Number, default: 0 }
//     },

//     financials: {
//       freightAmount: { type: Number, default: 0 }, // Auto-calculated
//       advancePaid: { type: Number, default: 0 },
//       dieselCost: { type: Number, default: 0 },
//       tollCost: { type: Number, default: 0 },
//       driverExpense: { type: Number, default: 0 },
//       otherExpense: { type: Number, default: 0 }
//     },

//     profitPerTrip: { type: Number, default: 0 },

//     totalFinancials: {
//       totalAmountForCompany: { type: Number, default: 0 },
//       totalAmountForVehicle: { type: Number, default: 0 },
//       totalAmountForSupplier: { type: Number, default: 0 },
//       netProfitOfTrip: { type: Number, default: 0 } // profitPerTrip ka naya naam
//     },

//     // Trip Schema mein ye field add karein
//     challans: [
//       {
//         fileUrl: String,
//         fileName: String,
//         uploadedAt: { type: Date, default: Date.now }
//       }
//     ],

//     status: {
//       type: String,
//       enum: ["pending", "running", "completed", "cancelled"],
//       default: "pending"
//     },

//     isActive: { type: Boolean, default: true },
//     isDeleted: { type: Boolean, default: false, index: true },
//     deletedAt: { type: Date, default: null },
//     meta: mongoose.Schema.Types.Mixed
//   },
//   { timestamps: true }
// );

// /* 🔥 PROFIT & FREIGHT CALCULATION LOGIC */
// function calculateFinancials(doc) {
//   const companyFreight = (doc.totalTonLoad || 0) * (doc.rates?.companyRatePerTon || 0);
//   const vehicleCost = (doc.totalTonLoad || 0) * (doc.rates?.vehicleRatePerTon || 0);

//   const expenses =
//     (doc.financials?.dieselCost || 0) +
//     (doc.financials?.tollCost || 0) +
//     (doc.financials?.driverExpense || 0) +
//     (doc.financials?.otherExpense || 0);

//   return {
//     freightAmount: companyFreight,
//     profit: companyFreight - vehicleCost - expenses
//   };
// }

// /* 🔥 AUTOMATED CALCULATION LOGIC */
// tripSchema.pre("save", function (next) {
//   const load = this.totalTonLoad || 0;
//   const rates = this.rates || {};
//   const expenses = this.financials || {};

//   // 1. Basic Totals Calculation
//   this.totalFinancials.totalAmountForCompany = load * (rates.companyRatePerTon || 0);
//   this.totalFinancials.totalAmountForVehicle = load * (rates.vehicleRatePerTon || 0);
//   this.totalFinancials.totalAmountForSupplier = load * (rates.supplierRatePerTon || 0);

//   // 2. Net Profit Calculation (Based on Account Type)
//   // Supplier (Middleman) ka profit = Company se mila - Vehicle ko diya - Expenses
//   const totalExpenses = (expenses.dieselCost || 0) + (expenses.tollCost || 0) + 
//                         (expenses.driverExpense || 0) + (expenses.otherExpense || 0);

//   this.totalFinancials.netProfitOfTrip = 
//     this.totalFinancials.totalAmountForCompany - 
//     this.totalFinancials.totalAmountForVehicle - 
//     totalExpenses;

//   next();
// });

// /* ✅ Middlewares for Calculation */
// tripSchema.pre("save", function (next) {
//   const { freightAmount, profit } = calculateFinancials(this);
//   this.financials.freightAmount = freightAmount;
//   this.profit = profit;
//   next();
// });

// export default mongoose.model("Trip", tripSchema);





// import mongoose from "mongoose";

// const tripSchema = new mongoose.Schema(
//   {
//     accountId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Account",
//       required: true,
//       index: true
//     },

//     createdByUserId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User"
//     },

//     supplierId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "SupplierOwner",
//       required: true
//     },

//     companyId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "CompanyOwner",
//       required: true
//     },

//     vehicleId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "VehicleOwner",
//       required: true
//     },

//     tripDate: Date,
//     loadingPoint: String,
//     unloadingPoint: String,

//     totalTonLoad: { type: Number, required: true },

//     rates: {
//       companyRatePerTon: Number,
//       vehicleRatePerTon: Number
//     },

//     financials: {
//       freightAmount: Number,
//       advancePaid: { type: Number, default: 0 },
//       dieselCost: { type: Number, default: 0 },
//       tollCost: { type: Number, default: 0 },
//       driverExpense: { type: Number, default: 0 },
//       otherExpense: { type: Number, default: 0 }
//     },

//     profit: { type: Number, default: 0 },

//     status: {
//       type: String,
//       enum: ["pending", "running", "completed", "cancelled"],
//       default: "pending"
//     },

//     meta: mongoose.Schema.Types.Mixed,

//     // ✅ Soft Delete
//     isDeleted: {
//       type: Boolean,
//       default: false,
//       index: true
//     },

//     deletedAt: {
//       type: Date,
//       default: null
//     },
//   },
//   { timestamps: true }
// );


// // ✅ ADD INDEX HERE 👇
// tripSchema.index({ accountId: 1, isDeleted: 1 });



// /* 🔥 PROFIT CALCULATION FUNCTION */
// function calculateProfit(doc) {
//   const companyFreight =
//     (doc.totalTonLoad || 0) *
//     (doc.rates?.companyRatePerTon || 0);

//   const vehicleCost =
//     (doc.totalTonLoad || 0) *
//     (doc.rates?.vehicleRatePerTon || 0);

//   const expenses =
//     (doc.financials?.dieselCost || 0) +
//     (doc.financials?.tollCost || 0) +
//     (doc.financials?.driverExpense || 0) +
//     (doc.financials?.otherExpense || 0);

//   return companyFreight - vehicleCost - expenses;
// }



// /* ✅ Before Save */
// tripSchema.pre("save", async function () {
//   this.profit = calculateProfit(this);
//   // next();
// });


// /* ✅ Before Update */
// tripSchema.pre("findOneAndUpdate", async function () {
//   const update = this.getUpdate();

//   // Get old document
//   const doc = await this.model.findOne(this.getQuery());

//   if (!doc) return;

//   // Merge old + new data
//   const merged = {
//     ...doc.toObject(),
//     ...update.$set,
//     rates: {
//       ...doc.rates,
//       ...update.$set?.rates
//     },
//     financials: {
//       ...doc.financials,
//       ...update.$set?.financials
//     }
//   };

//   // Recalculate profit
//   const profit = calculateProfit(merged);

//   // Set profit in update
//   this.setUpdate({
//     ...update,
//     $set: {
//       ...update.$set,
//       profit
//     }
//   });
// });


// export default mongoose.model("Trip", tripSchema);







// // import mongoose from "mongoose";

// // const tripSchema = new mongoose.Schema(
// //   {
// //     accountId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "Account",
// //       required: true,
// //       index: true
// //     },

// //     supplierId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "SupplierOwner",
// //       required: true
// //     },
// //     companyId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "CompanyOwner",
// //       required: true
// //     },
// //     vehicleId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "VehicleOwner",
// //       required: true
// //     },

// //     tripDate: Date,
// //     loadingPoint: String,
// //     unloadingPoint: String,

// //     totalTonLoad: { type: Number, required: true },

// //     rates: {
// //       companyRatePerTon: Number,
// //       vehicleRatePerTon: Number
// //     },

// //     financials: {
// //       freightAmount: Number,
// //       advancePaid: { type: Number, default: 0 },
// //       dieselCost: { type: Number, default: 0 },
// //       tollCost: { type: Number, default: 0 },
// //       driverExpense: { type: Number, default: 0 },
// //       otherExpense: { type: Number, default: 0 }
// //     },

// //     profit: Number,

// //     status: {
// //       type: String,
// //       enum: ["pending", "running", "completed", "cancelled"],
// //       default: "pending"
// //     },

// //     meta: mongoose.Schema.Types.Mixed,

// //     createdByUserId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User"
// //     },
// //     // isDeleted: { type: Boolean, default: false }
// //     // ✅ Soft Delete
// //     isDeleted: {
// //       type: Boolean,
// //       default: false,
// //       index: true
// //     }
// //   },
// //   { timestamps: true }
// // );

// // /* 🔥 AUTO PROFIT CALCULATION */
// // tripSchema.pre("save", function () {
// //   const companyFreight =
// //     (this.totalTonLoad || 0) *
// //     (this.rates?.companyRatePerTon || 0);

// //   const vehicleCost =
// //     (this.totalTonLoad || 0) *
// //     (this.rates?.vehicleRatePerTon || 0);

// //   const expenses =
// //     (this.financials?.dieselCost || 0) +
// //     (this.financials?.tollCost || 0) +
// //     (this.financials?.driverExpense || 0) +
// //     (this.financials?.otherExpense || 0);

// //   this.profit = companyFreight - vehicleCost - expenses;
// // });


// // export default mongoose.model("Trip", tripSchema);
