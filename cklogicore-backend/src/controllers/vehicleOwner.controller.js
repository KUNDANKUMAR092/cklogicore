import Vehicle from "../models/vehicleOwner.model.js";
import { logAudit } from "../utils/auditLogger.js";

/* ================= CREATE ================= */

export const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create({
      ...req.body,
      accountId: req.user.accountId
    });

    await logAudit({
      accountId: req.user.accountId,
      userId: req.user._id,
      action: "CREATE",
      entity: "Vehicle",
      entityId: vehicle._id,
      changes: req.body
    });

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: vehicle
    });

  } catch (err) {

    // ✅ Duplicate Error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number already exists"
      });
    }

    // ✅ Validation Error
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Create failed"
    });
  }
};


/* ================= GET (Pagination + Search) ================= */

export const getVehicles = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = Number(page);
    limit = Number(limit);

    const query = {
      accountId: req.user.accountId,

      // 🔍 Search
      vehicleNumber: {
        $regex: search,
        $options: "i"
      }
    };

    const total = await Vehicle.countDocuments(query);

    const vehicles = await Vehicle.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total,
      page,
      limit,
      data: vehicles
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Fetch failed"
    });
  }
};


/* ================= UPDATE (Only Active) ================= */

export const updateVehicle = async (req, res) => {
  try {

    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      accountId: req.user.accountId
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    // ❌ Block Inactive
    if (!vehicle.isActive) {
      return res.status(400).json({
        success: false,
        message: "Inactive vehicle cannot be updated"
      });
    }

    // ❌ Block vehicleNumber
    if (req.body.vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number cannot be changed"
      });
    }

    Object.assign(vehicle, req.body);
    await vehicle.save();

    res.json({
      success: true,
      message: "Updated",
      data: vehicle
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Update failed"
    });
  }
};


/* ================= TOGGLE ACTIVE ================= */

export const toggleVehicle = async (req, res) => {
  try {

    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      accountId: req.user.accountId
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found"
      });
    }

    vehicle.isActive = !vehicle.isActive;
    await vehicle.save();

    res.json({
      success: true,
      message: "Status updated",
      data: vehicle
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Toggle failed"
    });
  }
};