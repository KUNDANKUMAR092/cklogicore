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
  
  // Middleware (Zod) validation ke baad hume hamesha clean data 
  // req.body me milta hai (body: { ... }) aapke middleware structure ke hisab se.
  let bodyData = { ...req.body };

  // 1. SECURITY: Auto-calculated fields ko delete karein (Double safety)
  delete bodyData.totalFinancials; 

  // 2. AUTO-ENTITY ID DETECTION
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

  // 3. RATE MASKING (Taki user apni identity ke hisab se rate na dekh/bhar sake)
  if (bodyData.rates) {
    if (accountType === ACCOUNT_TYPES.SUPPLIER) delete bodyData.rates.supplierRatePerTon;
    else if (accountType === ACCOUNT_TYPES.COMPANY) delete bodyData.rates.companyRatePerTon;
    else if (accountType === ACCOUNT_TYPES.VEHICLE) delete bodyData.rates.vehicleRatePerTon;
  }

  // 4. Challan handling
  const challanFiles = req.files ? req.files.map(f => ({
    fileUrl: f.path.replace(/\\/g, "/"),
    fileName: f.originalname
  })) : [];

  const trip = await Trip.create({
    ...bodyData,
    challans: challanFiles,
    accountId: accountId,
    createdByUserId: userId,
    tripId: bodyData.tripId || `TRP-${Date.now()}`
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
  const { accountId } = req.user;
  
  // Zod middleware se data extract karein
  let updateData = { ...req.body.body };

  // Security: Calculation protect karein
  delete updateData.totalFinancials;

  const trip = await Trip.findOne({ _id: id, accountId: accountId, isDeleted: false });
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

  // Agar rates ya financials bhej rahe hain, toh unhe deeply merge karein
  if (updateData.rates) trip.rates = { ...trip.rates, ...updateData.rates };
  if (updateData.financials) trip.financials = { ...trip.financials, ...updateData.financials };
  
  // Baki fields update karein
  Object.assign(trip, updateData);

  await trip.save(); // 🔥 Hook re-calculates everything
  
  res.json({ success: true, message: "Trip updated successfully", data: trip });
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
