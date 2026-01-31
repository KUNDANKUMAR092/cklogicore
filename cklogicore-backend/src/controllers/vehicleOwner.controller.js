// src/controllers/vehicleOwner.controllers.js

import VehicleOwner from "../models/vehicleOwner.model.js";
import { ACCOUNT_TYPES } from "../constants/accountTypes.js";

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

  // 🛡️ Agar body mein vehicleNumber bhej bhi diya, 
  // toh model hook use block kar dega ya hum yahan delete kar sakte hain
  const updateData = { ...req.body };
  delete updateData.vehicleNumber; 

  const vehicle = await VehicleOwner.findOneAndUpdate(
    { 
      _id: id, 
      accountId: req.user.accountId, 
      isDeleted: false 
    },
    { $set: updateData },
    { new: true, runValidators: true }
  ).lean();

  if (!vehicle) {
    return res.status(404).json({ success: false, message: "Vehicle not found" });
  }

  res.json({ 
    success: true, 
    message: "Vehicle information updated", 
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
  const vehicle = await VehicleOwner.findOneAndUpdate(
    { _id: req.params.id, accountId: req.user.accountId },
    { isDeleted: true, isActive: false }
  );
  if (!vehicle) return res.status(404).json({ message: "Vehicle not found" });
  res.json({ success: true, message: "Vehicle removed successfully" });
});








// import Vehicle from "../models/vehicleOwner.model.js";
// import { logAudit } from "../utils/auditLogger.js";

// /* ================= CREATE ================= */

// export const createVehicle = async (req, res) => {
//   try {
//     const vehicle = await Vehicle.create({
//       ...req.body,
//       accountId: req.user.accountId
//     });

//     await logAudit({
//       accountId: req.user.accountId,
//       userId: req.user._id,
//       action: "CREATE",
//       entity: "Vehicle",
//       entityId: vehicle._id,
//       changes: req.body
//     });

//     res.status(201).json({
//       success: true,
//       message: "Vehicle created successfully",
//       data: vehicle
//     });

//   } catch (err) {

//     // ✅ Duplicate Error
//     if (err.code === 11000) {
//       return res.status(400).json({
//         success: false,
//         message: "Vehicle number already exists"
//       });
//     }

//     // ✅ Validation Error
//     if (err.name === "ValidationError") {
//       return res.status(400).json({
//         success: false,
//         message: err.message
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Create failed"
//     });
//   }
// };


// /* ================= GET (Pagination + Search) ================= */

// export const getVehicles = async (req, res) => {
//   try {
//     let { page = 1, limit = 10, search = "" } = req.query;

//     page = Number(page);
//     limit = Number(limit);

//     const query = {
//       accountId: req.user.accountId,

//       // 🔍 Search
//       vehicleNumber: {
//         $regex: search,
//         $options: "i"
//       }
//     };

//     const total = await Vehicle.countDocuments(query);

//     const vehicles = await Vehicle.find(query)
//       .skip((page - 1) * limit)
//       .limit(limit)
//       .sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       total,
//       page,
//       limit,
//       data: vehicles
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Fetch failed"
//     });
//   }
// };


// /* ================= UPDATE (Only Active) ================= */

// export const updateVehicle = async (req, res) => {
//   try {

//     const vehicle = await Vehicle.findOne({
//       _id: req.params.id,
//       accountId: req.user.accountId
//     });

//     if (!vehicle) {
//       return res.status(404).json({
//         success: false,
//         message: "Vehicle not found"
//       });
//     }

//     // ❌ Block Inactive
//     if (!vehicle.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: "Inactive vehicle cannot be updated"
//       });
//     }

//     // ❌ Block vehicleNumber
//     if (req.body.vehicleNumber) {
//       return res.status(400).json({
//         success: false,
//         message: "Vehicle number cannot be changed"
//       });
//     }

//     Object.assign(vehicle, req.body);
//     await vehicle.save();

//     res.json({
//       success: true,
//       message: "Updated",
//       data: vehicle
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Update failed"
//     });
//   }
// };


// /* ================= TOGGLE ACTIVE ================= */

// export const toggleVehicle = async (req, res) => {
//   try {

//     const vehicle = await Vehicle.findOne({
//       _id: req.params.id,
//       accountId: req.user.accountId
//     });

//     if (!vehicle) {
//       return res.status(404).json({
//         success: false,
//         message: "Vehicle not found"
//       });
//     }

//     vehicle.isActive = !vehicle.isActive;
//     await vehicle.save();

//     res.json({
//       success: true,
//       message: "Status updated",
//       data: vehicle
//     });

//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Toggle failed"
//     });
//   }
// };