// src/controller/trip.controller.js

import Trip from "../models/trip.model.js";
import mongoose from "mongoose";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// CREATE
export const createTrip = catchAsync(async (req, res, next) => {
  const { accountId, userId } = req.user;
  let bodyData = { ...req.body };

  const challanFiles = req.files ? req.files.map(f => ({
    fileUrl: f.path.replace(/\\/g, "/"),
    fileName: f.originalname,
    uploadedAt: new Date()
  })) : [];

  const trip = await Trip.create({
    ...bodyData,
    accountId,
    createdByUserId: userId,
    challans: challanFiles,
    tripId: bodyData.tripId || `TRP-${Date.now()}`
  });

  res.status(201).json({ success: true, data: trip });
});

// GET ALL (Search, Pagination, Summary)
export const getTrips = catchAsync(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    status,        
    activeStatus,  
    search, 
    startDate, 
    endDate, 
    companyId, 
    vehicleId, 
    supplierId,
    sortBy = "createdAt", // default sorting
    sortOrder = -1        // default descending (newest first)
  } = req.query;

  const { accountId } = req.user;
  const skip = (Number(page) - 1) * Number(limit);

  // 1. Initial Match (Basic Filters)
  let matchQuery = { 
    accountId: new mongoose.Types.ObjectId(accountId), 
    isDeleted: false 
  };

  if (status) matchQuery.status = status;
  if (activeStatus === "active") matchQuery.isActive = true;
  if (activeStatus === "inactive") matchQuery.isActive = false;
  if (companyId) matchQuery.companyId = new mongoose.Types.ObjectId(companyId);
  if (vehicleId) matchQuery.vehicleId = new mongoose.Types.ObjectId(vehicleId);
  if (supplierId) matchQuery.supplierId = new mongoose.Types.ObjectId(supplierId);

  if (startDate && endDate) {
    matchQuery.tripDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  // 2. Aggregation Pipeline
  const pipeline = [
    { $match: matchQuery },
    
    // Join with Collections
    { $lookup: { from: "companyowners", localField: "companyId", foreignField: "_id", as: "company" } },
    { $unwind: { path: "$company", preserveNullAndEmptyArrays: true } },

    { $lookup: { from: "vehicleowners", localField: "vehicleId", foreignField: "_id", as: "vehicle" } },
    { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },

    { $lookup: { from: "supplierowners", localField: "supplierId", foreignField: "_id", as: "supplier" } },
    { $unwind: { path: "$supplier", preserveNullAndEmptyArrays: true } },

    // 3. Global Search
    ...(search ? [{
      $match: {
        $or: [
          { tripId: { $regex: search, $options: "i" } },
          { loadingPoint: { $regex: search, $options: "i" } },
          { unloadingPoint: { $regex: search, $options: "i" } },
          { "company.name": { $regex: search, $options: "i" } },
          { "vehicle.vehicleNumber": { $regex: search, $options: "i" } },
          { "supplier.name": { $regex: search, $options: "i" } }
        ]
      }
    }] : []),

    // 4. Facets for Pagination & Advanced Summary
    {
      $facet: {
        metadata: [{ $count: "total" }],
        summary: [{
          $group: {
            _id: null,
            totalProfit: { $sum: "$totalFinancials.profitPerTrip" },
            totalCompanyPay: { $sum: "$totalFinancials.totalAmountForCompany" },
            totalVehiclePay: { $sum: "$totalFinancials.totalAmountForVehicle" },
            totalSupplierPay: { $sum: "$totalFinancials.totalAmountForSupplier" },
            totalWeight: { $sum: "$totalTonLoad" }, // ✅ Added Total Weight Sum
            tripCount: { $sum: 1 }
          }
        }],
        data: [
          { $sort: { [sortBy]: Number(sortOrder) } },
          { $skip: skip },
          { $limit: Number(limit) }
        ]
      }
    }
  ];

  const result = await Trip.aggregate(pipeline);

  const totalRecords = result[0].metadata[0]?.total || 0;
  const summary = result[0].summary[0] || { 
    totalProfit: 0, totalCompanyPay: 0, totalVehiclePay: 0, totalSupplierPay: 0, totalWeight: 0, tripCount: 0 
  };
  const trips = result[0].data;

  res.json({
    success: true,
    pagination: {
      totalRecords,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / Number(limit))
    },
    summary,
    data: trips
  });
});

// GET SINGLE
export const getTripById = catchAsync(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, accountId: req.user.accountId, isDeleted: false })
    .populate("supplierId companyId vehicleId");
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
  res.json({ success: true, data: trip });
});

// UPDATE (Deep Merge)
export const updateTrip = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { accountId } = req.user;
  let updateData = { ...req.body };
  delete updateData.totalFinancials;

  const trip = await Trip.findOne({ _id: id, accountId, isDeleted: false });
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });

  if (updateData.rates) trip.rates = { ...trip.rates.toObject(), ...updateData.rates };
  if (updateData.financials) trip.financials = { ...trip.financials.toObject(), ...updateData.financials };
  
  delete updateData.rates; delete updateData.financials;
  Object.assign(trip, updateData);

  await trip.save();
  res.json({ success: true, message: "Trip updated", data: trip });
});

// STATUS TOGGLE
export const toggleTripStatus = catchAsync(async (req, res) => {
  const trip = await Trip.findOne({ _id: req.params.id, accountId: req.user.accountId, isDeleted: false });
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
  trip.isActive = !trip.isActive;
  await trip.save();
  res.json({ success: true, message: `Trip ${trip.isActive ? 'Activated' : 'Deactivated'}`, isActive: trip.isActive });
});

// WORKFLOW STATUS
export const updateTripWorkflowStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId, isDeleted: false },
    { $set: { status } },
    { new: true, runValidators: true }
  );
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
  res.json({ success: true, message: `Workflow status updated to ${status}`, data: trip });
});

// DELETE
export const deleteTrip = catchAsync(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId, isDeleted: false },
    { $set: { isDeleted: true, status: "cancelled", deletedAt: new Date() } },
    { new: true }
  );
  if (!trip) return res.status(404).json({ success: false, message: "Trip not found" });
  res.json({ success: true, message: "Trip deleted" });
});

// CHALLAN MANAGEMENT
import fs from "fs";
import path from "path";

export const addChallans = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // 1. Check if files exist in the request
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Please select at least one file to upload." 
    });
  }

  // 2. Find the Trip
  const trip = await Trip.findById(id);
  if (!trip) {
    req.files.forEach(f => {
      const filePath = path.join(process.cwd(), f.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });
    return res.status(404).json({ success: false, message: "Trip record not found." });
  }

  // 3. Validation Logic (Limit = 4)
  const maxLimit = 4;
  const currentCount = trip.challans ? trip.challans.length : 0;
  const newUploadCount = req.files.length;
  const remainingSpace = maxLimit - currentCount;

  // Case: If already at limit or new upload exceeds the limit
  if (currentCount >= maxLimit || (currentCount + newUploadCount) > maxLimit) {
    
    // Delete files from disk to prevent storage waste
    req.files.forEach(f => {
      const filePath = path.join(process.cwd(), f.path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    // Dynamic English Error Messaging
    let errorMsg = "";
    if (currentCount >= maxLimit) {
      errorMsg = `Upload limit reached! You already have ${maxLimit} challans. Please delete existing files before uploading new ones.`;
    } else {
      errorMsg = `Only ${remainingSpace} slot(s) available, but you tried to upload ${newUploadCount} files. Please reduce the number of files.`;
    }

    return res.status(400).json({ 
      success: false, 
      message: errorMsg 
    });
  }

  // 4. Success Case: Prepare Data and Save
  const newChallans = req.files.map(f => ({
    fileUrl: f.path.replace(/\\/g, "/"),
    fileName: f.originalname,
    uploadedAt: new Date()
  }));

  const updatedTrip = await Trip.findByIdAndUpdate(
    id,
    { $push: { challans: { $each: newChallans } } },
    { new: true }
  );

  res.status(200).json({ 
    success: true, 
    message: `Successfully uploaded ${newUploadCount} challan(s).`,
    data: updatedTrip 
  });
});

export const removeChallan = catchAsync(async (req, res) => {
  const trip = await Trip.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    { $pull: { challans: { _id: req.params.challanId } } },
    { new: true }
  );
  res.json({ success: true, message: "Challan removed", data: trip });
});