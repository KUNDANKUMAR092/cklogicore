// src/controller/trip.controller.js

import Trip from "../models/trip.model.js";
import SupplierOwner from "../models/supplierOwner.model.js";
import CompanyOwner from "../models/companyOwner.model.js";
import VehicleOwner from "../models/vehicleOwner.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import mongoose from "mongoose";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 1. CREATE TRIP (With Auto-Entity Detection & Security)
export const createTrip = catchAsync(async (req, res) => {
  const { accountType, accountId, userId } = req.user;
  let bodyData = { ...req.body };

  // --- Scenerio: Data Parsing from FormData ---
  if (typeof bodyData.rates === 'string') bodyData.rates = JSON.parse(bodyData.rates);
  if (typeof bodyData.financials === 'string') bodyData.financials = JSON.parse(bodyData.financials);

  // --- Scenerio: AUTO-ENTITY ID DETECTION (Fixes NULL ID issues) ---
  if (accountType === ACCOUNT_TYPES.SUPPLIER) {
    const supplier = await SupplierOwner.findOne({ accountId, isDeleted: false });
    if (supplier) bodyData.supplierId = supplier._id;
  } 
  else if (accountType === ACCOUNT_TYPES.COMPANY) {
    const company = await CompanyOwner.findOne({ accountId, isDeleted: false });
    if (company) bodyData.companyId = company._id;
  } 
  else if (accountType === ACCOUNT_TYPES.VEHICLE) {
    const vehicle = await VehicleOwner.findOne({ accountId, isDeleted: false });
    if (vehicle) bodyData.vehicleId = vehicle._id;
  }

  // --- Scenerio: Rate Masking (Security) ---
  if (accountType === ACCOUNT_TYPES.SUPPLIER) delete bodyData.rates.supplierRatePerTon;
  else if (accountType === ACCOUNT_TYPES.COMPANY) delete bodyData.rates.companyRatePerTon;
  else if (accountType === ACCOUNT_TYPES.VEHICLE) delete bodyData.rates.vehicleRatePerTon;

  // --- Scenerio: Multiple Challan handling ---
  const challanFiles = req.files ? req.files.map(f => ({
    fileUrl: f.path.replace(/\\/g, "/"), // URL fix for Windows
    fileName: f.originalname
  })) : [];

  const trip = await Trip.create({
    ...bodyData,
    challans: challanFiles,
    accountId: accountId,
    createdByUserId: userId,
    tripId: bodyData.tripId || `TRP-${Date.now()}` // Automatic Trip ID generation
  });

  res.status(201).json({ success: true, data: trip });
});

// 2. GET TRIPS (With Summary, Filters & Pagination)
export const getTrips = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, status, search, startDate, endDate, companyId, vehicleId, supplierId } = req.query;
  const { accountId, accountType } = req.user;

  // Query Construction
  const query = { accountId: new mongoose.Types.ObjectId(accountId), isDeleted: false };
  
  if (status) query.status = status;
  if (companyId) query.companyId = new mongoose.Types.ObjectId(companyId);
  if (vehicleId) query.vehicleId = new mongoose.Types.ObjectId(vehicleId);
  if (supplierId) query.supplierId = new mongoose.Types.ObjectId(supplierId);

  if (startDate && endDate) {
    query.tripDate = { 
        $gte: new Date(startDate), 
        $lte: new Date(endDate) 
    };
  }

  // Global Search logic
  if (search) {
    query.$or = [
      { tripId: { $regex: search, $options: "i" } },
      { loadingPoint: { $regex: search, $options: "i" } },
      { unloadingPoint: { $regex: search, $options: "i" } }
    ];
  }

  // 🔥 Total Summary (Aggregation for UI Totals)
  const summary = await Trip.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalProfit: { $sum: "$totalFinancials.profitPerTrip" },
        totalAmountForCompany: { $sum: "$totalFinancials.totalAmountForCompany" },
        totalAmountForVehicle: { $sum: "$totalFinancials.totalAmountForVehicle" },
        totalAmountForSupplier: { $sum: "$totalFinancials.totalAmountForSupplier" }
      }
    }
  ]);

  // Paginated List with full details
  const [totalRecords, trips] = await Promise.all([
    Trip.countDocuments(query),
    Trip.find(query)
      .populate("supplierId companyId vehicleId", "name mobile vehicleNumber")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean()
  ]);

  // Response Masking based on Account Type
  const totals = summary[0] || { totalProfit: 0, totalAmountForCompany: 0, totalAmountForVehicle: 0, totalAmountForSupplier: 0 };
  
  if (accountType === ACCOUNT_TYPES.SUPPLIER) delete totals.totalAmountForSupplier;
  else if (accountType === ACCOUNT_TYPES.COMPANY) delete totals.totalAmountForCompany;
  else if (accountType === ACCOUNT_TYPES.VEHICLE) delete totals.totalAmountForVehicle;

  res.json({
    success: true,
    pagination: {
      totalRecords,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / limit)
    },
    summary: totals,
    data: trips
  });
});

// 3. UPDATE TRIP (With Re-calculation)
export const updateTrip = catchAsync(async (req, res) => {
  const { id } = req.params;
  let updateData = { ...req.body };

  if (typeof updateData.rates === 'string') updateData.rates = JSON.parse(updateData.rates);
  if (typeof updateData.financials === 'string') updateData.financials = JSON.parse(updateData.financials);

  const trip = await Trip.findOne({ _id: id, accountId: req.user.accountId, isDeleted: false });
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

  // Update trip instance
  Object.assign(trip, updateData);
  await trip.save(); // 🔥 Pre-save hook re-calculates financials automatically
  
  res.json({ success: true, message: "Trip details updated", data: trip });
});

// 4. SOFT DELETE (Scenario: Cancel and Hide)
export const deleteTrip = catchAsync(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId, isDeleted: false },
    { $set: { isDeleted: true, status: "cancelled", deletedAt: new Date(), isActive: false } },
    { new: true }
  );
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
  res.json({ success: true, message: "Trip moved to trash/cancelled" });
});

// 5. TOGGLE STATUS
export const toggleTripStatus = catchAsync(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, accountId: req.user.accountId, isDeleted: false });
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
  
  trip.isActive = !trip.isActive;
  await trip.save();
  
  res.json({ success: true, message: `Trip status is now ${trip.isActive ? "Active" : "Inactive"}` });
});


























// import Trip from "../models/trip.model.js";
// import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
// import mongoose from "mongoose";

// const catchAsync = (fn) => (req, res, next) => {
//   Promise.resolve(fn(req, res, next)).catch(next);
// };

// // 1. CREATE TRIP
// export const createTrip = catchAsync(async (req, res) => {
//   const { accountType } = req.user;
//   let bodyData = { ...req.body };

//   // Parse JSON from FormData
//   if (typeof bodyData.rates === 'string') bodyData.rates = JSON.parse(bodyData.rates);
//   if (typeof bodyData.financials === 'string') bodyData.financials = JSON.parse(bodyData.financials);

//   // 🛡️ Rate Masking
//   if (accountType === ACCOUNT_TYPES.SUPPLIER) delete bodyData.rates.supplierRatePerTon;
//   else if (accountType === ACCOUNT_TYPES.COMPANY) delete bodyData.rates.companyRatePerTon;
//   else if (accountType === ACCOUNT_TYPES.VEHICLE) delete bodyData.rates.vehicleRatePerTon;

//   // Multiple Challan handling
//   const challanFiles = req.files ? req.files.map(f => ({
//     fileUrl: f.path,
//     fileName: f.originalname
//   })) : [];

//   const trip = await Trip.create({
//     ...bodyData,
//     challans: challanFiles,
//     accountId: req.user.accountId,
//     createdByUserId: req.user.userId
//   });

//   res.status(201).json({ success: true, data: trip });
// });

// // 2. GET TRIPS (With UI-level Summary & Global Search)
// export const getTrips = catchAsync(async (req, res) => {
//   const { page = 1, limit = 10, status, search, startDate, endDate, companyId, vehicleId } = req.query;
//   const { accountId, accountType } = req.user;

//   // Query Construction
//   const query = { accountId: new mongoose.Types.ObjectId(accountId), isDeleted: false };
  
//   if (status) query.status = status;
//   if (companyId) query.companyId = new mongoose.Types.ObjectId(companyId);
//   if (vehicleId) query.vehicleId = new mongoose.Types.ObjectId(vehicleId);
//   if (startDate && endDate) {
//     query.tripDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
//   }

//   // Global Search logic
//   if (search) {
//     query.$or = [
//       { tripId: { $regex: search, $options: "i" } },
//       { loadingPoint: { $regex: search, $options: "i" } },
//       { unloadingPoint: { $regex: search, $options: "i" } }
//     ];
//   }

//   // 🔥 Total Summary Calculation based on Filters (UI Totals)
//   const summary = await Trip.aggregate([
//     { $match: query },
//     {
//       $group: {
//         _id: null,
//         totalProfit: { $sum: "$totalFinancials.profitPerTrip" },
//         totalAmountForCompany: { $sum: "$totalFinancials.totalAmountForCompany" },
//         totalAmountForVehicle: { $sum: "$totalFinancials.totalAmountForVehicle" },
//         totalAmountForSupplier: { $sum: "$totalFinancials.totalAmountForSupplier" }
//       }
//     }
//   ]);

//   // Paginated List
//   const [totalRecords, trips] = await Promise.all([
//     Trip.countDocuments(query),
//     Trip.find(query)
//       .populate("supplierId companyId vehicleId", "name mobile vehicleNumber")
//       .skip((page - 1) * limit)
//       .limit(Number(limit))
//       .sort({ createdAt: -1 })
//       .lean()
//   ]);

//   // Response Masking
//   const totals = summary[0] || { totalProfit: 0, totalAmountForCompany: 0, totalAmountForVehicle: 0, totalAmountForSupplier: 0 };
  
//   if (accountType === ACCOUNT_TYPES.SUPPLIER) delete totals.totalAmountForSupplier;
//   else if (accountType === ACCOUNT_TYPES.COMPANY) delete totals.totalAmountForCompany;
//   else if (accountType === ACCOUNT_TYPES.VEHICLE) delete totals.totalAmountForVehicle;

//   res.json({
//     success: true,
//     pagination: {
//       totalRecords,
//       currentPage: Number(page),
//       totalPages: Math.ceil(totalRecords / limit)
//     },
//     summary: totals, // This is the 'totalProfit' and other totals for UI
//     data: trips
//   });
// });

// // 3. UPDATE TRIP
// export const updateTrip = catchAsync(async (req, res) => {
//   if (typeof req.body.rates === 'string') req.body.rates = JSON.parse(req.body.rates);
  
//   const trip = await Trip.findOne({ _id: req.params.id, accountId: req.user.accountId });
//   if (!trip) return res.status(404).json({ message: "Trip not found" });

//   Object.assign(trip, req.body);
//   await trip.save(); // 🔥 Re-calculates profitPerTrip
  
//   res.json({ success: true, message: "Trip updated", data: trip });
// });

// // 4. SOFT DELETE
// export const deleteTrip = catchAsync(async (req, res) => {
//   const trip = await Trip.findOneAndUpdate(
//     { _id: req.params.id, accountId: req.user.accountId },
//     { isDeleted: true, status: "cancelled", deletedAt: new Date() },
//     { new: true }
//   );
//   if (!trip) return res.status(404).json({ message: "Trip not found" });
//   res.json({ success: true, message: "Trip deleted" });
// });

// // 5. TOGGLE STATUS
// export const toggleTripStatus = catchAsync(async (req, res) => {
//   const trip = await Trip.findOne({ _id: req.params.id, accountId: req.user.accountId });
//   if (!trip) return res.status(404).json({ message: "Trip not found" });
//   trip.isActive = !trip.isActive;
//   await trip.save();
//   res.json({ success: true, message: `Trip status updated to ${trip.isActive}` });
// });
