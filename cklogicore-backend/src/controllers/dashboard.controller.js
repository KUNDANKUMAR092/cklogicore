import Trip from "../models/trip.model.js";
import CompanyOwner from "../models/companyOwner.model.js";
import VehicleOwner from "../models/vehicleOwner.model.js";
import mongoose from "mongoose";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};


export const getDashboardStats = catchAsync(async (req, res) => {
  const accountId = new mongoose.Types.ObjectId(req.user.accountId);
  const { startDate, endDate, search, companyId, vehicleId } = req.query;

  // 1. Dynamic Match Filter Build Karein
  let matchQuery = { 
    accountId, 
    isDeleted: false 
  };

  // Date Range Filter
  if (startDate && endDate) {
    matchQuery.tripDate = { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate) 
    };
  }

  // Dropdown Filters
  if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId);
  if (vehicleId) matchQuery.vehicleId = new mongoose.Types.ObjectId(vehicleId);

  // Global Search (Search across Trip ID, Loading/Unloading Points)
  if (search) {
    matchQuery.$or = [
      { tripId: { $regex: search, $options: "i" } },
      { loadingPoint: { $regex: search, $options: "i" } },
      { unloadingPoint: { $regex: search, $options: "i" } }
    ];
  }

  // 2. Main Aggregation Pipeline
  const stats = await Trip.aggregate([
    { $match: matchQuery },
    {
      $facet: {
        // Financial Overview based on Filters
        overview: [
          {
            $group: {
              _id: null,
              totalProfit: { $sum: "$totalFinancials.profitPerTrip" },
              totalRevenue: { $sum: "$totalFinancials.totalAmountForCompany" },
              totalTrips: { $sum: 1 },
              totalWeight: { $sum: "$totalTonLoad" }
            }
          }
        ],
        // Status Chart based on Filters
        statusStats: [
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ],
        // Performance by Company
        companyPerformance: [
          {
            $group: {
              _id: "$companyId",
              totalBusiness: { $sum: "$totalFinancials.totalAmountForCompany" },
              tripCount: { $sum: 1 }
            }
          },
          { $sort: { totalBusiness: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "companyowners",
              localField: "_id",
              foreignField: "_id",
              as: "company"
            }
          },
          { $unwind: "$company" },
          { $project: { name: "$company.name", totalBusiness: 1, tripCount: 1 } }
        ]
      }
    }
  ]);

  // 3. Monthly Growth (Ispe hamesha 6 month ka data dikhayenge, filter ka asar nahi)
  const monthlyTrend = await Trip.aggregate([
    { 
      $match: { 
        accountId, 
        isDeleted: false, 
        tripDate: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } 
      } 
    },
    {
      $group: {
        _id: { month: { $month: "$tripDate" }, year: { $year: "$tripDate" } },
        profit: { $sum: "$totalFinancials.profitPerTrip" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  res.json({
    success: true,
    filtersApplied: { startDate, endDate, search },
    data: {
      overview: stats[0].overview[0] || { totalProfit: 0, totalRevenue: 0, totalTrips: 0, totalWeight: 0 },
      statusBreakdown: stats[0].statusStats,
      topCompanies: stats[0].companyPerformance,
      monthlyTrend
    }
  });
});



// export const getDashboardStats = catchAsync(async (req, res) => {
//   const accountId = new mongoose.Types.ObjectId(req.user.accountId);

//   // 1. Overview Stats (Profit, Total Freight, Total Trips)
//   const overviewStats = await Trip.aggregate([
//     { $match: { accountId, isDeleted: false } },
//     {
//       $group: {
//         _id: null,
//         totalProfit: { $sum: "$profit" },
//         totalFreight: { $sum: "$financials.freightAmount" },
//         totalTrips: { $sum: 1 },
//         avgProfitPerTrip: { $avg: "$profit" }
//       }
//     }
//   ]);

//   // 2. Trip Status Breakdown (For Pie Chart)
//   const statusStats = await Trip.aggregate([
//     { $match: { accountId, isDeleted: false } },
//     {
//       $group: {
//         _id: "$status",
//         count: { $sum: 1 }
//       }
//     }
//   ]);

//   // 3. Monthly Profit & Trip Count (For Line/Bar Chart - Last 6 Months)
//   const sixMonthsAgo = new Date();
//   sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

//   const monthlyStats = await Trip.aggregate([
//     { 
//       $match: { 
//         accountId, 
//         isDeleted: false, 
//         tripDate: { $gte: sixMonthsAgo } 
//       } 
//     },
//     {
//       $group: {
//         _id: { 
//           month: { $month: "$tripDate" }, 
//           year: { $year: "$tripDate" } 
//         },
//         profit: { $sum: "$profit" },
//         trips: { $sum: 1 }
//       }
//     },
//     { $sort: { "_id.year": 1, "_id.month": 1 } }
//   ]);

//   // 4. Resource Counts
//   const [totalCompanies, totalVehicles] = await Promise.all([
//     CompanyOwner.countDocuments({ accountId, isDeleted: false }),
//     VehicleOwner.countDocuments({ accountId, isDeleted: false })
//   ]);

//   res.json({
//     success: true,
//     data: {
//       overview: overviewStats[0] || { totalProfit: 0, totalFreight: 0, totalTrips: 0 },
//       statusBreakdown: statusStats,
//       monthlyGrowth: monthlyStats,
//       resources: {
//         totalCompanies,
//         totalVehicles
//       }
//     }
//   });
// });