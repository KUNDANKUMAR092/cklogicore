// src/controllers/vehicleOwner.controller.js

import VehicleOwner from "../models/vehicleOwner.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";
import { flattenObject } from "../utils/flattenObject.js";

const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ================= ADD VEHICLE ================= */
export const createVehicle = catchAsync(async (req, res) => {
  // 🛡️ SECURITY: Khud Vehicle account hokar dusra Vehicle add nahi kar sakte
  if (req.user.accountType === ACCOUNT_TYPES.VEHICLE) {
    return res.status(403).json({ 
      success: false, 
      message: "Individual vehicle owners cannot add other vehicles." 
    });
  }

  const { vehicleNumber } = req.body;

  const exists = await VehicleOwner.findOne({ 
    vehicleNumber: vehicleNumber.toUpperCase(), 
    accountId: req.user.accountId, 
    isDeleted: false 
  });

  if (exists) return res.status(400).json({ message: "This vehicle number is already added in your list" });

  const vehicle = await VehicleOwner.create({
    ...req.body,
    accountId: req.user.accountId,
    createdBy: req.user.userId
  });

  res.status(201).json({ success: true, data: vehicle });
});

/* ================= GET VEHICLES ================= */
export const getVehicles = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = "", status = "all" } = req.query;
  const query = { accountId: req.user.accountId, isDeleted: false };

  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;

  if (search) {
    query.$or = [
      { vehicleNumber: { $regex: search, $options: "i" } },
      { "owner.name": { $regex: search, $options: "i" } }
    ];
  }

  const [total, vehicles] = await Promise.all([
    VehicleOwner.countDocuments(query),
    VehicleOwner.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 })
      .lean()
  ]);

  res.json({ success: true, total, data: vehicles });
});

/* ================= UPDATE VEHICLE ================= */
export const updateVehicle = catchAsync(async (req, res) => {
  const { id } = req.params;

  const existingVehicle = await VehicleOwner.findOne({ 
    _id: id, 
    accountId: req.user.accountId, 
    isDeleted: false 
  });

  if (!existingVehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  // 🛡️ Logic: 
  if (!existingVehicle.isActive) {
    return res.status(400).json({ 
      success: false, 
      message: "Inactive vehicle cannot be updated. Please activate it first." 
    });
  }

  let updateData = { ...req.body };
  delete updateData.vehicleNumber;
  delete updateData._id;
  delete updateData.accountId;
  delete updateData.createdBy;

  const flattenedData = flattenObject(updateData);

  const vehicle = await VehicleOwner.findOneAndUpdate(
    { 
      _id: id, 
      accountId: req.user.accountId, 
      isDeleted: false,
      isActive: true 
    },
    { $set: flattenedData },
    { new: true, runValidators: true }
  ).lean();

  res.json({ 
    success: true, 
    message: "Vehicle information updated successfully", 
    data: vehicle 
  });
});

/* ================= TOGGLE STATUS VEHICLE ================= */
export const toggleVehicleStatus = catchAsync(async (req, res) => {
  const vehicle = await VehicleOwner.findOne({ 
    _id: req.params.id, 
    accountId: req.user.accountId,
    isDeleted: false 
  });

  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });

  vehicle.isActive = !vehicle.isActive;
  await vehicle.save();

  res.json({ success: true, message: `Vehicle ${vehicle.isActive ? "activated" : "deactivated"}` });
});

/* ================= SOFT DELETE VEHICLE ================= */
export const deleteVehicle = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Update isDeleted to true instead of removing the document
  const vehicle = await VehicleOwner.findOneAndUpdate(
    { 
      _id: id, 
      accountId: req.user.accountId,
      isDeleted: false // Sirf unhe delete karein jo pehle se delete nahi hain
    },
    { 
      $set: { 
        isDeleted: true, 
        isActive: false 
      } 
    },
    { new: true }
  );

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found or already deleted" });
  }

  // Audit Log ke liye ID attach karein (agar middleware use kar rahe hain)
  res.locals.entityId = id;

  res.json({ 
    success: true, 
    message: "Vehicle deleted successfully" 
  });
});