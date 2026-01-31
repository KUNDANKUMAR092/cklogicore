import Trip from "../models/trip.model.js";
import CompanyOwner from "../models/companyOwner.model.js";
import VehicleOwner from "../models/vehicleOwner.model.js";
import mongoose from "mongoose";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const getDashboardStats = catchAsync(async (req, res) => {
  const accountId = new mongoose.Types.ObjectId(req.user.accountId);

  // 1. Overview Stats (Profit, Total Freight, Total Trips)
  const overviewStats = await Trip.aggregate([
    { $match: { accountId, isDeleted: false } },
    {
      $group: {
        _id: null,
        totalProfit: { $sum: "$profit" },
        totalFreight: { $sum: "$financials.freightAmount" },
        totalTrips: { $sum: 1 },
        avgProfitPerTrip: { $avg: "$profit" }
      }
    }
  ]);

  // 2. Trip Status Breakdown (For Pie Chart)
  const statusStats = await Trip.aggregate([
    { $match: { accountId, isDeleted: false } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  // 3. Monthly Profit & Trip Count (For Line/Bar Chart - Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyStats = await Trip.aggregate([
    { 
      $match: { 
        accountId, 
        isDeleted: false, 
        tripDate: { $gte: sixMonthsAgo } 
      } 
    },
    {
      $group: {
        _id: { 
          month: { $month: "$tripDate" }, 
          year: { $year: "$tripDate" } 
        },
        profit: { $sum: "$profit" },
        trips: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // 4. Resource Counts
  const [totalCompanies, totalVehicles] = await Promise.all([
    CompanyOwner.countDocuments({ accountId, isDeleted: false }),
    VehicleOwner.countDocuments({ accountId, isDeleted: false })
  ]);

  res.json({
    success: true,
    data: {
      overview: overviewStats[0] || { totalProfit: 0, totalFreight: 0, totalTrips: 0 },
      statusBreakdown: statusStats,
      monthlyGrowth: monthlyStats,
      resources: {
        totalCompanies,
        totalVehicles
      }
    }
  });
});