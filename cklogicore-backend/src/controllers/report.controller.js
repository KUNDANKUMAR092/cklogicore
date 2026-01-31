import Trip from "../models/trip.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import mongoose from "mongoose";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getFinancialReport = catchAsync(async (req, res) => {
  const { startDate, endDate, target, companyId, vehicleId } = req.query;
  const { accountId, accountType } = req.user;

  // 1. Query Setup
  const query = { 
    accountId: new mongoose.Types.ObjectId(accountId), 
    isDeleted: false 
  };

  // 2. Date & Entity Filters
  if (startDate && endDate) {
    query.tripDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }
  if (companyId) query.companyId = new mongoose.Types.ObjectId(companyId);
  if (vehicleId) query.vehicleId = new mongoose.Types.ObjectId(vehicleId);

  // 3. Aggregation Logic
  const report = await Trip.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalTrips: { $sum: 1 },
        totalWeight: { $sum: "$totalTonLoad" },
        // Individual Totals from our new Model keys
        totalCompanyAmount: { $sum: "$totalFinancials.totalAmountForCompany" },
        totalVehicleAmount: { $sum: "$totalFinancials.totalAmountForVehicle" },
        totalSupplierAmount: { $sum: "$totalFinancials.totalAmountForSupplier" },
        totalNetProfit: { $sum: "$totalFinancials.profitPerTrip" },
        // Status breakdown
        completedTrips: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        pendingTrips: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
      }
    },
    {
      $project: {
        _id: 0,
        totalTrips: 1,
        totalWeight: 1,
        completedTrips: 1,
        pendingTrips: 1,
        // UI Summary Logic based on target/account
        summary: {
            totalAmount: {
                $cond: [
                    { $eq: [target, ACCOUNT_TYPES.COMPANY] }, 
                    "$totalCompanyAmount", 
                    "$totalVehicleAmount"
                ]
            },
            totalNetProfit: {
                // Profit sirf Owner/Supplier ko hi dikhna chahiye
                $cond: [
                    { $or: [{ $eq: [accountType, ACCOUNT_TYPES.SUPPLIER] }, { $eq: [accountType, 'OWNER'] }] },
                    "$totalNetProfit",
                    null // Hide for others
                ]
            }
        }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: report[0] || { totalTrips: 0, totalWeight: 0, summary: { totalAmount: 0, totalNetProfit: 0 } }
  });
});







// import Trip from "../models/trip.model.js";
// import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
// import mongoose from "mongoose";

// const catchAsync = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// export const getFinancialReport = catchAsync(async (req, res) => {
//   const { startDate, endDate, target, companyId, vehicleId, supplierId } = req.query;
//   const { accountId } = req.user;

//   // 1. Basic Query setup
//   const query = { 
//     accountId: new mongoose.Types.ObjectId(accountId), 
//     isDeleted: false 
//   };

//   // 2. Date Range Filter
//   if (startDate && endDate) {
//     query.tripDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
//   }

//   // 3. Entity Specific Filters
//   if (companyId) query.companyId = new mongoose.Types.ObjectId(companyId);
//   if (vehicleId) query.vehicleId = new mongoose.Types.ObjectId(vehicleId);
//   if (supplierId) query.supplierId = new mongoose.Types.ObjectId(supplierId);

//   // 4. Aggregation Pipeline
//   const report = await Trip.aggregate([
//     { $match: query },
//     {
//       $group: {
//         _id: null,
//         totalTrips: { $sum: 1 },
//         totalWeight: { $sum: "$totalTonLoad" },
//         // Dynamic Amount Calculation based on Target
//         totalAmount: {
//           $sum: target === ACCOUNT_TYPES.COMPANY 
//             ? { $multiply: ["$totalTonLoad", "$rates.companyRatePerTon"] }
//             : { $multiply: ["$totalTonLoad", "$rates.vehicleRatePerTon"] }
//         },
//         // Status breakdown
//         completedCount: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
//         pendingCount: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } }
//       }
//     },
//     {
//       $project: {
//         _id: 0,
//         totalTrips: 1,
//         totalWeight: 1,
//         totalAmount: 1,
//         completedCount: 1,
//         pendingCount: 1,
//         avgRate: { $divide: ["$totalAmount", "$totalWeight"] }
//       }
//     }
//   ]);

//   res.status(200).json({
//     success: true,
//     target: target || "GENERAL",
//     data: report[0] || { totalTrips: 0, totalWeight: 0, totalAmount: 0 }
//   });
// });

// // Extra: Get Detailed Summary for a specific party
// export const getPartyWiseSummary = catchAsync(async (req, res) => {
//     // Isme aap kisi ek specific Company ya Supplier ka pura ledger nikal sakte hain
//     // Same target logic yahan bhi apply hoga
// });









// import Trip from "../models/trip.model.js";

// export const supplierReport = async (req, res) => {
//   const report = await Trip.aggregate([
//     { $match: { accountId: req.user.accountId } },
//     {
//       $group: {
//         _id: "$supplierId",
//         totalTrips: { $sum: 1 },
//         totalProfit: { $sum: "$profit" }
//       }
//     }
//   ]);

//   res.json(report);
// };

// export const vehicleReport = async (req, res) => {
//   const report = await Trip.aggregate([
//     { $match: { accountId: req.user.accountId } },
//     {
//       $group: {
//         _id: "$vehicleId",
//         totalTrips: { $sum: 1 },
//         totalProfit: { $sum: "$profit" }
//       }
//     }
//   ]);

//   res.json(report);
// };

// export const companyReport = async (req, res) => {
//   const report = await Trip.aggregate([
//     {
//       $match: {
//         accountId: req.user.accountId
//       }
//     },
//     {
//       $group: {
//         _id: "$companyId",
//         totalTrips: { $sum: 1 },
//         totalProfit: { $sum: "$profit" }
//       }
//     }
//   ]);

//   res.json(report);
// };

// export const profitSummary = async (req, res) => {
//   try {
//     const data = await Trip.aggregate([
//       {
//         $match: {
//           accountId: req.user.accountId,
//           isDeleted: false
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalTrips: { $sum: 1 },
//           totalProfit: { $sum: "$profit" }
//         }
//       }
//     ]);

//     res.json(data[0] || { totalTrips: 0, totalProfit: 0 });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to generate profit summary" });
//   }
// };

